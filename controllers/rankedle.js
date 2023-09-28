import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'url'
import ffmpeg from 'fluent-ffmpeg'
import yauzl from 'yauzl'
import crypto from 'node:crypto'
import tmp from 'tmp'
import { Sequelize, Op } from 'sequelize'
import members from './members.js'
import { Rankedles, RankedleMaps, RankedleScores, RankedleStats } from './database.js'
import Logger from '../utils/logger.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const RANKEDLE_PATH = path.resolve(__dirname, '../rankedle')
const EGG_PATH = path.join(RANKEDLE_PATH, 'song.egg')
const OGG_PATH = path.join(RANKEDLE_PATH, 'song.ogg')
const TRIMED_OGG_PATH = path.join(RANKEDLE_PATH, 'preview_full.ogg')
const BITRATE = 96
const RANGES = [
    '00:01',
    '00:02',
    '00:04',
    '00:07',
    '00:11',
    '00:16'
]
const FIRST_TRY_TEXT = [
    'Point faible : trop fort·e',
    'Hole-in-one! ⛳',
    'Bravo. Mais avoues, c\'était facile...',
    'Impressionnant',
    'Quelle expertise !',
    'Tu as l\'oreille d\'un pro ! 👂',
    '🎉',
    '👏 👏 👏',
    'One shotted',
    'Du premier coup ! 🤯',
    'A Winner Is You'
]
const WON_TEXT = [
    'Une modeste victoire, mais une victoire tout de même.',
    'Bravo ! Tu as trouvé la réponse !'
]
const LOSE_TEXT = [
    'Qui aurait cru que trouver la bonne réponse serait aussi difficile ? Vous, apparemment !',
    'Dommage, tu as perdu.',
    'Zut alors, pourtant c\'était facile.',
    'Tu feras mieux la prochaine fois...',
    'Tu feras mieux la prochaine fois... ou pas.',
    'On t\'a pourtant donné trente secondes et six essais...',
    'Tu feras mieux demain 🥶',
    'Ce n\'est que partie remise.',
    'Avoue, tu n\'aimes pas la map de toute manière.',
    'À ce stade, même Shazam serait perdu !',
    'Bah alors ?'
]

export default class Rankedle {
    static async downloadSong(url) {
        try {
            const downloadRequest = await fetch(url)
            if(downloadRequest.ok) {
                const songZip = await downloadRequest.arrayBuffer()
                const zipBuffer = Buffer.from(songZip)
                const songTmp = tmp.fileSync()
                fs.writeFileSync(songTmp.name, zipBuffer)
                return songTmp
            } else {
                throw new Error(`Song download failed (url: ${url})`)
            }
        } catch(e) {
            throw new Error(`Song download failed (url: ${url})`)
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

    static async trimSilence(songPath, outPath) {
        return new Promise((res, rej) => {
            ffmpeg(songPath)
            .audioFilters([
                'silenceremove=1:0:-50dB'
            ])
            .addOptions('-c:a libopus')
            .addOutputOption('-map_metadata -1')
            .audioBitrate(BITRATE)
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

    static async generateRankedle(mapId = null) {
        try {
            // Get random map from database
            const where = mapId ? { 'id': mapId } : {}
            const randomMap = await RankedleMaps.findAll({
                where: { '$rankedle.id$': { [Op.eq]: null }, ...where },
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
                await this.trimSilence(EGG_PATH, OGG_PATH)
        
                // Get time range
                const dataTrimed = await this.getSongMetaData(OGG_PATH)
                const duration = Math.floor(dataTrimed.format.duration)
                const start = duration >= 30 ? Math.round(Math.random() * (duration - 30)) : 0
        
                // Trim song
                await this.trim(OGG_PATH, TRIMED_OGG_PATH, start)

                for(let i = 0; i < RANGES.length; i++) {
                    await this.trim(TRIMED_OGG_PATH, path.join(RANKEDLE_PATH, `preview_${i}.ogg`), '00:00', RANGES[i])
                }

                await Rankedles.create({ mapId: mapId })
            }
        } catch(e) {
            Logger.log('Rankedle', 'ERROR', `Imposible de générer une Rankedle pour la map (${e.message})`)
        }
    }

    static async getSongList(memberId, query) {
        const currentRankedle = await this.getCurrentRankedle()
        const userScore = await this.getUserScore(currentRankedle.id, memberId)
        const mapsToExclude = userScore?.details ? userScore.details.filter(d => d.status === 'fail').map(d => d.mapId) : []

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
                    }
                },
                id: {
                    [Op.notIn]: mapsToExclude
                }
            },
            limit: 5,
            raw: true
        })

        return !maps ? {} : maps.map(m => {
            return {
                id: m.id,
                name: `${m.map.metadata.songAuthorName} - ${m.map.metadata.songName}${m.map.metadata.songSubName !== '' ? ` ${m.map.metadata.songSubName}` : ''}`
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

    static async getUserStats(memberId) {
        const stats = await RankedleStats.findOne({
            where: { memberId }
        })
        return stats
    }

    static async playRequest(req, res) {
        if(!req.session.user) throw new Error('User not connected')
        const user = req.session.user

        const rankedle = await this.getCurrentRankedle()
        if(!rankedle) throw new Error('No rankedle found')

        const rankedleScore = await this.getUserScore(rankedle.id, user.id)

        const skips = rankedleScore ? rankedleScore.skips : 0
        const preview = path.join(RANKEDLE_PATH, `preview_${skips < 6 && !rankedleScore?.success ? skips : 'full'}.ogg`)

        const stat = fs.statSync(preview)
        const fileSize = stat.size
        const range = req.headers.range

        if(range) {
            const parts = range.replace(/bytes=/, '').split('-')
            const start = parseInt(parts[0], 10)
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1

            if(start >= fileSize) {
                res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize)
                return
            }

            const chunksize = (end - start) + 1
            const file = fs.createReadStream(preview, { start, end })
            const head = {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'audio/ogg',
                'Cache-Controle': 'max-age=0, no-cache, no-store, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': 'Wed, 21 Oct 2015 01:00:00 GMT'
            }

            res.writeHead(206, head)
            file.pipe(res)
        } else {
            const head = {
                'Content-Length': fileSize,
                'Content-Type': 'audio/ogg',
                'Cache-Controle': 'max-age=0, no-cache, no-store, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': 'Wed, 21 Oct 2015 01:00:00 GMT'
            }

            res.writeHead(200, head)
            fs.createReadStream(preview).pipe(res)
        }
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
                    score.resultMessage = this.getRandomText(LOSE_TEXT)
                } else {
                    score.skips++
                    const details = [
                        ...score.details,
                        { status: 'skip', text: `SKIP (${6 - score.skips + 1})` }
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
                    { status: 'skip', text: 'SKIP (6)' }
                ],
                success: null
            })
        }

        if(score.success !== null) {
            await this.updatePlayerStats(score)
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

        const validMapData = await RankedleMaps.findOne({
            where: { id: rankedle.mapId }
        })

        const songName = `${mapData.map.metadata.songAuthorName} - ${mapData.map.metadata.songName}${mapData.map.metadata.songSubName !== '' ? ` ${mapData.map.metadata.songSubName}` : ''}`

        let score = await RankedleScores.findOne({
            where: {
                rankedleId: rankedle.id,
                memberId: user.id
            }
        })

        const success = mapData.map.metadata.songAuthorName === validMapData.map.metadata.songAuthorName && mapData.map.metadata.songName === validMapData.map.metadata.songName

        if(score) {
            if(score.success === null) {
                if(success && score.skips < 6) {
                    score.success = true
                    score.resultMessage = this.getRandomText(WON_TEXT)
                } else {
                    if(score.skips === 6) {
                        score.success = false
                        score.resultMessage = this.getRandomText(LOSE_TEXT)
                    } else {
                        score.skips++
                        const details = [
                            ...score.details,
                            { status: 'fail', text: songName, mapId: mapData.id }
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
                skips: success ? 0 : 1,
                success: success ? true : null,
                resultMessage: success ? this.getRandomText(FIRST_TRY_TEXT) : null
            }
            if(!success) scoreData.details = [{ status: 'fail', text: songName, mapId: mapData.id }]
            score = await RankedleScores.create(scoreData)
        }

        if(score.success !== null) {
            await this.updatePlayerStats(score)
        }

        res.json(score)
    }

    static async updatePlayerStats(score) {
        const stats = await RankedleStats.findOne({
            where: { memberId: score.memberId }
        })

        if(stats) {
            if(score.skips < 6) stats[`try${score.skips + 1}`]++
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
                try1: 0,
                try2: 0,
                try3: 0,
                try4: 0,
                try5: 0,
                try6: 0,
                played: 1,
                won: score.success ? 1 : 0,
                currentStreak: score.success ? 1 : 0,
                maxStreak: score.success ? 1 : 0
            }
            if(score.skips > 0) statsData[`skip${score.skips}`] = 1
            await RankedleStats.create(statsData)
        }
    }

    static async getResult(rankedle, memberId) {
        if(!rankedle) return null

        const rankedleScore = await this.getUserScore(rankedle.id, memberId)
        if(!rankedleScore || rankedleScore.success === null) return null

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
            },
            text: rankedleScore.resultMessage
        }
    }

    static async shareRequest(req, res) {
        if(!req.session.user) throw new Error('User not connected')
        const user = req.session.user

        const rankedle = await this.getCurrentRankedle()
        if(!rankedle) throw new Error('No rankedle found')

        const rankedleScore = await this.getUserScore(rankedle.id, user.id)
        if(!rankedleScore || rankedleScore.success === null) return null

        const steps = [ null, null, null, null, null, null ]
        if(rankedleScore.details) {
            for(let i = 0; i < rankedleScore.details.length; i++) {
                const detail = rankedleScore.details[i]
                steps[i] = detail.status
            }
        }
        if(rankedleScore.success) steps[rankedleScore.skips] = 'success'

        let result = `#Rankedle #${rankedle.id}\n\n`
        result += (rankedle.sucess ? '🔊' : '🔇') + steps.map(s => s === 'skip' ? '⬛️' : s === 'fail' ? '🟥' : s === 'success' ? '🟩' : '⬜️').join('') + '\n\n'
        result += '<https://bsaber.fr/rankedle>'

        res.send(result)
    }

    static async statsRequest(req, res) {
        if(!req.session.user) throw new Error('User not connected')
        const user = req.session.user

        const rankedleStats = await this.getUserStats(user.id)

        res.json(rankedleStats)
    }

    static getRandomText(texts) {
        const random = crypto.randomInt(texts.length)
        return texts[random]
    }

    static async getRanking(session) {
        const rankingList = await RankedleScores.findAll({
            where: {
                success: {
                    [Op.eq]: true
                }
            },
            attributes: [
                'memberId',
                [ Sequelize.fn('avg', Sequelize.col('skips')), 'avg_skips' ]
            ],
            group: [ 'memberId' ],
            order: [
                [ 'avg_skips', 'asc' ]
            ]
        })

        const ranking = await Promise.all(rankingList.map(async (r, i) => {
            const member = await members.getUser(session, r.memberId)
            r.avatar = member ? `${members.getAvatar(member.user)}?size=80` : ''
            r.name = member ? member.user.username : ''
            r.rank = i + 1
            return r
        }))

        return ranking
    }
}