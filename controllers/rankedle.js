import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'url'
import ffmpeg from 'fluent-ffmpeg'
import yauzl from 'yauzl'
import tmp from 'tmp'
import { Sequelize, Op } from 'sequelize'
import { Rankedles, RankedleMaps, RankedleScores, RankedleStats } from './database.js'
import Logger from '../utils/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const RANKEDLE_PATH = path.resolve(__dirname, '../rankedle')
const EGG_PATH = path.join(RANKEDLE_PATH, 'song.egg')
const OGG_PATH = path.join(RANKEDLE_PATH, 'song.ogg')
const TRIMED_OGG_PATH = path.join(RANKEDLE_PATH, 'song_trimed.ogg')
const MAX_BITRATE = 96000
const RANGES = [
    '00:01',
    '00:02',
    '00:04',
    '00:07',
    '00:11',
    '00:16'
]

export default class Rankedle {
    static async downloadSong(url) {
        const downloadRequest = await fetch(url)
        if(downloadRequest.ok) {
            const songZip = await downloadRequest.arrayBuffer()
            const zipBuffer = Buffer.from(songZip)
            const songTmp = tmp.fileSync()
            fs.writeFileSync(songTmp.name, zipBuffer)
            return songTmp
        } else {
            throw new Error('Song download failed')
        }
    }

    static async extractEgg(songZip, outPath) {
        const songFile = fs.createWriteStream(outPath)

        return new Promise((res, rej) => {
            yauzl.open(songZip, { lazyEntries: true }, (err, zipFile) => {
                if(err) rej(err)
                zipFile.readEntry()
                zipFile.on('entry', (entry) => {
                    if(!/\.egg$/.test(entry.fileName)) {
                        zipFile.readEntry()
                    } else {
                        zipFile.openReadStream(entry, (err, readStream) => {
                            if(err) rej(err)
                            readStream.on('end', () => {
                                zipFile.readEntry()
                            })
                            readStream.pipe(songFile)
                        })
                    }
                })
                zipFile.on('end', () => {
                    res(songFile)
                })
            })
        })
    }

    static async trimSilence(songPath, outPath, bitrate = MAX_BITRATE) {
        return new Promise((res, rej) => {
            ffmpeg(songPath)
            .audioFilters([
                'silenceremove=1:0:-50dB'
            ])
            .addOptions('-c:a libopus')
            .audioBitrate((bitrate > MAX_BITRATE ? MAX_BITRATE : bitrate) / 1000)
            .output(outPath)
            .on('error', (err) => {
                rej(err)
            })
            .on('end', () => {
                res()
            })
            .run()
        })
    }

    static async getSongMetaData(songPath) {
        return new Promise((res, rej) => {
            ffmpeg.ffprobe(songPath, (err, data) => {
                if(err) rej(err)
                res(data)
            })
        })
    }

    static async trim(songPath, outPath, from = 0, duration = 30) {
        return new Promise((res, rej) => {
            ffmpeg(songPath)
            .addInputOption(`-ss ${from}`)
            .addOutputOption(`-t ${duration}`)
            .addOption('-c:a copy')
            .output(outPath)
            .on('error', (err) => {
                rej(err)
            })
            .on('end', () => {
                res()
            })
            .run()
        })
    }

    static async generateRankedle() {
        try {
            // Get random map from database
            const randomMap = await RankedleMaps.findAll({
                where: { '$rankedle.id$': { [Op.eq]: null } },
                include: {
                    model: Rankedles,
                    required: false
                },
                order: Sequelize.literal('rand()'),
                limit: 1,
                raw: true
            })

            if(randomMap.length === 1) {
                const mapId = randomMap[0].id
                const map = randomMap[0].map
                const downloadURL = map.versions[map.versions.length - 1].downloadURL

                // Download zip and extract .egg
                const songZip = await this.downloadSong(downloadURL)
                await this.extractEgg(songZip.name, EGG_PATH)
                songZip.removeCallback()
        
                // Trim silence
                const data = await this.getSongMetaData(EGG_PATH)
                const bitrate = data.format.bit_rate
                await this.trimSilence(EGG_PATH, OGG_PATH, bitrate)
        
                // Get time range
                const dataTrimed = await this.getSongMetaData(OGG_PATH)
                const duration = Math.floor(dataTrimed.format.duration)
                const start = duration >= 30 ? Math.round(Math.random() * (duration - 30)) : 0
        
                // Trim song
                await this.trim(OGG_PATH, TRIMED_OGG_PATH, start)

                await Rankedles.create({ mapId: mapId })
            }
        } catch(e) {
            Logger.log('Rankedle', 'ERROR', e.message)
        }
    }

    static async getSongList(query) {
        const maps = await RankedleMaps.findAll({
            where: {
                [Op.or]: {
                    'map.metadata.songAuthorName': {
                        [Op.like]: `%${query}%`
                    },
                    'map.metadata.songName': {
                        [Op.like]: `%${query}%`
                    },
                    'map.metadata.songSubName': {
                        [Op.like]: `%${query}%`
                    },
                    'map.metadata.levelAuthorName': {
                        [Op.like]: `%${query}%`
                    }
                }
            },
            raw: true
        })

        return !maps ? {} : maps.map(m => {
            return {
                id: m.id,
                name: `${m.map.metadata.songAuthorName} - ${m.map.metadata.songName}${m.map.metadata.songSubName !== '' ? ` ${m.map.metadata.songSubName}` : ''}  (${m.map.metadata.levelAuthorName})`
            }
        })
    }

    static async getCurrentRankedle() {
        const rankedle = await Rankedles.findOne({
            where: { date: new Date() },
            order: [
                [ 'id', 'desc' ]
            ],
            raw: true
        })
        return rankedle
    }

    static async getUserScore(rankedleId, memberId) {
        const score = await RankedleScores.findOne({
            where: { rankedleId,  memberId }
        })
        return score
    }

    static async playRequest(req, res) {
        if(!req.session.user) throw new Error('User not connected')
        const user = req.session.user

        const rankedle = await this.getCurrentRankedle()
        if(!rankedle) throw new Error('No rankedle found')

        const rankedleScore = await this.getUserScore(rankedle.id, user.id)

        const skips = rankedleScore ? rankedleScore.skips : 0
        const range = RANGES[skips]

        res.writeHead(200, { 'Content-Type': 'audio/ogg' })

        const fileStream = fs.createReadStream(TRIMED_OGG_PATH)
        const ffmpegStream = ffmpeg(fileStream)
            .format('ogg')
            .on('error', (err) => {})
        if(skips < 6 && !rankedleScore?.success) ffmpegStream.addOutputOption(`-t ${range}`)
        ffmpegStream.pipe(res, { end: true })
    }

    static async scoreRequest(req, res) {
        if(!req.session.user) throw new Error('User not connected')
        const user = req.session.user

        const rankedle = await this.getCurrentRankedle()
        if(!rankedle) throw new Error('No rankedle found')

        const rankedleScore = await this.getUserScore(rankedle.id, user.id)

        res.json(rankedleScore)
    }

    static async skipRequest(req, res) {
        if(!req.session.user) throw new Error('User not connected')
        const user = req.session.user

        const rankedle = await this.getCurrentRankedle()
        if(!rankedle) throw new Error('No rankedle found')

        let score = await RankedleScores.findOne({
            where: {
                rankedleId: rankedle.id,
                memberId: user.id
            }
        })

        if(score) {
            if(score.success === null) {
                if(score.skips === 6) {
                    score.success = false
                } else {
                    score.skips++
                    const details = [
                        ...score.details,
                        { status: 'skip', data: `SKIP (${6 - score.skips + 1})` }
                    ]
                    score.details = details
                }
                await score.save()
            }
        } else {
            score = await RankedleScores.create({
                rankedleId: rankedle.id,
                memberId: user.id,
                skips: 1,
                details: [
                    { status: 'skip', data: 'SKIP (6)' }
                ],
                success: null
            })
        }

        res.json(score)
    }

    static async submitRequest(req, res) {
        if(!req.session.user) throw new Error('User not connected')
        const user = req.session.user

        const rankedle = await this.getCurrentRankedle()
        if(!rankedle) throw new Error('No rankedle found')

        const mapId = req.body?.id
        if(!mapId) throw new Error('Invalid request')

        const mapData = await RankedleMaps.findOne({
            where: { id: mapId }
        })

        const songName = `${mapData.map.metadata.songAuthorName} - ${mapData.map.metadata.songName}${mapData.map.metadata.songSubName !== '' ? ` ${mapData.map.metadata.songSubName}` : ''}`

        let score = await RankedleScores.findOne({
            where: {
                rankedleId: rankedle.id,
                memberId: user.id
            }
        })

        if(score) {
            if(score.success === null) {
                if(mapId === rankedle.mapId && score.skips < 6) {
                    score.success = mapId === rankedle.mapId
                } else {
                    if(score.skips === 6) {
                        score.success = false
                    } else {
                        score.skips++
                        const details = [
                            ...score.details,
                            { status: 'fail', data: songName }
                        ]
                        score.details = details
                    }
                }
                await score.save()
            }
        } else {
            const scoreData = {
                rankedleId: rankedle.id,
                memberId: user.id,
                skips: mapId === rankedle.mapId ? 0 : 1,
                success: mapId === rankedle.mapId ? true : null
            }
            if(mapId !== rankedle.mapId) scoreData.details = [{ status: 'fail', data: songName }]
            score = await RankedleScores.create(scoreData)
        }

        if(score.success) {
            await this.updatePlayerStats(score)
        }

        res.json(score)
    }

    static async updatePlayerStats(score) {
        const stats = await RankedleStats.findOne({
            where: { memberId: score.memberId }
        })

        if(stats) {
            if(score.skips > 0) stats[`skip${score.skips}`]++
            stats.played++
            if(score.success) {
                stats.won++
                stats.currentStreak++
                if(stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak
            } else {
                stats.currentStreak = 0
            }
            await stats.save()
        } else {
            const statsData = {
                memberId: score.memberId,
                skip1: 0,
                skip2: 0,
                skip3: 0,
                skip4: 0,
                skip5: 0,
                skip6: 0,
                played: 1,
                won: score.success ? 1 : 0,
                currentStreak: score.success ? 1 : 0,
                maxStreak: score.success ? 1 : 0
            }
            if(score.skips > 0) statsData[`skip${score.skips}`] = 1
            await RankedleStats.create(statsData)
        }
    }

    static async getResult(req, res) {
        if(!req.session.user) throw new Error('User not connected')
        const user = req.session.user

        const rankedle = await this.getCurrentRankedle()
        if(!rankedle) throw new Error('No rankedle found')

        const rankedleScore = await this.getUserScore(rankedle.id, user.id)
        if(!rankedleScore || rankedleScore.success === null) throw new Error('Don\'t try to cheat please')

        const mapData = await RankedleMaps.findOne({
            where: { id: rankedle.mapId },
            raw: true
        })

        const steps = [ null, null, null, null, null, null ]
        if(rankedleScore.details) {
            for(let i = 0; i < rankedleScore.details.length; i++) {
                const detail = rankedleScore.details[i]
                if(detail.status === 'fail') steps[i] = false
            }
        }
        if(rankedleScore.success) steps[rankedleScore.skips] = true

        return {
            won: rankedleScore.success,
            skips: rankedleScore.skips,
            steps,
            map: {
                id: mapData.map.id,
                cover: mapData.map.versions[mapData.map.versions.length - 1].coverURL,
                songName: `${mapData.map.metadata.songAuthorName} - ${mapData.map.metadata.songName}${mapData.map.metadata.songSubName !== '' ? ` ${mapData.map.metadata.songSubName}` : ''}`,
                levelAuthorName: mapData.map.metadata.levelAuthorName
            }
        }
    }
}