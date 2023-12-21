import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'url'
import ffmpeg from 'fluent-ffmpeg'
import yauzl from 'yauzl'
import tmp from 'tmp'
import { Sequelize, Op } from 'sequelize'
import members from './members.js'
import { Rankedles, RankedleMaps, RankedleScores, RankedleStats, RankedleMessages } from './database.js'
import mime from '../utils/mime.js'
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
            .outputOptions([
                '-map_metadata -1',
                '-map 0:a'
            ])
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
            await this.finish()

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

    static async getLastRankedle() {
        const rankedle = await Rankedles.findOne({
            order: [
                [ 'id', 'desc' ]
            ],
            limit: 1,
            raw: true
        })
        return rankedle
    }

    static async getRankedleList() {
        const rankedleList = await Rankedles.findAll({
            order: [
                [ 'id', 'desc' ]
            ],
            raw: true
        })
        return rankedleList
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
        await this.setDateStart(rankedle.id, user.id, rankedleScore)

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

    static async setDateStart(rankedleId, userId, score) {
        if(!score) {
            await RankedleScores.create({
                rankedleId: rankedleId,
                memberId: userId,
                dateStart: new Date(),
                skips: 0
            })
        }
    }

    static async setDateEnd(score) {
        if(!score.dateEnd) {
            score.dateEnd = new Date()
            score.save()
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

        const date = new Date()

        if(score) {
            if(score.success === null) {
                if(!score.dateStart) score.dateStart = date

                if(score.skips === 6) {
                    score.success = false
                    score.messageId = await this.getRandomMessage('lose')
                } else {
                    score.skips++
                    const details = [
                        ...(score.details ?? []),
                        { status: 'skip', text: `SKIP (${6 - score.skips + 1})`, date: Math.round(date.getTime() / 1000) }
                    ]
                    score.details = details
                }

                await score.save()
            }
        } else {
            score = await RankedleScores.create({
                rankedleId: rankedle.id,
                memberId: user.id,
                dateStart: date,
                skips: 1,
                details: [
                    { status: 'skip', text: 'SKIP (6)', date: Math.round(date.getTime() / 1000) }
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

        const date = new Date()

        if(score) {
            if(score.success === null) {
                if(!score.dateStart) score.dateStart = date

                if(success && score.skips < 6) {
                    score.success = true
                    score.messageId = await this.getRandomMessage('won')
                } else {
                    if(score.skips === 6) {
                        score.success = false
                        score.messageId = await this.getRandomMessage('lose')
                    } else {
                        score.skips++
                        const details = [
                            ...(score.details ?? []),
                            { status: 'fail', text: songName, mapId: mapData.id, date: Math.round(date.getTime() / 1000) }
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
                dateStart: date,
                skips: success ? 0 : 1,
                success: success ? true : null,
                messageId: success ? await this.getRandomMessage('first_try') : null
            }
            if(!success) scoreData.details = [{ status: 'fail', text: songName, mapId: mapData.id, date: Math.round(date.getTime() / 1000) }]
            score = await RankedleScores.create(scoreData)
        }

        if(score.success !== null) {
            await this.updatePlayerStats(score)
        }

        res.json(score)
    }

    static async updatePlayerStats(score) {
        await this.setDateEnd(score)

        const stats = await RankedleStats.findOne({
            where: { memberId: score.memberId }
        })

        if(stats) {
            stats.played++
            if(score.success) {
                stats[`try${score.skips + 1}`]++
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
                won: 0,
                currentStreak: 0,
                maxStreak: 0
            }
            if(score.success) {
                statsData[`try${score.skips + 1}`] = 1
                statsData.won = 1
                statsData.currentStreak = 1
                statsData.maxStreak = 1
            }
            await RankedleStats.create(statsData)
        }
    }

    static async getResult(rankedle, memberId) {
        if(!rankedle) return null

        const rankedleScore = await this.getUserScore(rankedle.id, memberId)
        if(!rankedleScore || rankedleScore.success === null) return null

        const mapId = memberId === '1125101235087872010' && rankedle.id === 82 ? 1553 : rankedle.mapId

        const mapData = await RankedleMaps.findOne({
            where: { id: mapId },
            raw: true
        })

        const steps = [ null, null, null, null, null, null ]
        if(rankedleScore.details) {
            for(let i = 0; i < rankedleScore.details.length; i++) {
                const detail = rankedleScore.details[i]
                steps[i] = detail.status
            }
        }
        if(rankedleScore.success) steps[rankedleScore.skips] = 'success'
        const score = [
            (!rankedleScore.success ? '🔇' : rankedleScore.skips === 0 ? '🔊' : '🔉'),
            ...steps.map(s => s === 'skip' ? '⬛' : s === 'fail' ? '🟥' : s === 'success' ? '🟩' : '⬜️')
        ]

        return {
            won: rankedleScore.success,
            skips: rankedleScore.skips,
            score,
            map: {
                id: mapData.map.id,
                cover: mapData.map.versions[mapData.map.versions.length - 1].coverURL,
                songName: `${mapData.map.metadata.songAuthorName} - ${mapData.map.metadata.songName}${mapData.map.metadata.songSubName !== '' ? ` ${mapData.map.metadata.songSubName}` : ''}`,
                levelAuthorName: mapData.map.metadata.levelAuthorName
            },
            message: await this.getMessageById(rankedleScore.messageId)
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

        let result = `Rankedle #${rankedle.id}\n\n`
        result += (!rankedleScore.success ? '🔇' : rankedleScore.skips === 0 ? '🔊' : '🔉') + steps.map(s => s === 'skip' ? '⬛' : s === 'fail' ? '🟥' : s === 'success' ? '🟩' : '⬜️').join('') + '\n\n'
        result += '<https://bsaber.fr/rankedle>'

        res.send(result)
    }

    static async statsRequest(req, res) {
        if(!req.session.user) throw new Error('User not connected')
        const user = req.session.user

        const userId = req.query.userId ?? user.id

        const rankedleStats = await this.getUserStats(userId)

        res.json(rankedleStats)
    }

    static async getRandomMessage(type) {
        const randomMessage = await RankedleMessages.findAll({
            where: { type },
            order: Sequelize.literal('rand()'),
            limit: 1,
            attributes: [ 'id' ],
            raw: true
        })
        return randomMessage.length === 1 ? randomMessage[0].id : null
    }

    static async getMessageById(messageId) {
        const message = await RankedleMessages.findOne({
            where: { id: messageId },
        })
        if(message?.image) {
            const imageBuffer = Buffer.from(message.image)
            const imageMimeType = message.image ? await mime.getMimeType(imageBuffer) : null
            message.image = imageMimeType ? `data:${imageMimeType};base64,${imageBuffer.toString('base64')}` : null
        }
        return message
    }

    static async getRanking() {
        const rankingList = await RankedleStats.findAll({
            attributes: [
                'memberId',
                'played',
                'won',
                'currentStreak',
                'maxStreak',
                [ Sequelize.literal('(try1 * 8) + (try2 * 6) + (try3 * 4) + (try4 * 3) + (try5 * 2) + try6'), 'score' ]
            ],
            order: [
                [ 'score', 'desc' ]
            ],
            raw: true
        })

        const memberList = await members.getGuildMembers()
        const ranking = rankingList.map((r, i) => {
            const member = memberList.find(m => m.user.id === r.memberId)
            r.avatar = member ? `${members.getAvatar(member.user)}?size=80` : ''
            r.name = member ? member.user.username : ''
            r.rank = i + 1
            return r
        })

        return ranking
    }

    static async finish() {
        const rankedle = await this.getLastRankedle()
        
        if(rankedle) {
            const scores = await this.getRankedleScores(rankedle.id)
            const unfinishedScores = scores.filter(s => s.success === null && s.skips > 0)

            for(const score of unfinishedScores) {
                score.success = false
                await score.save()
                await this.updatePlayerStats(score)
            }
        }
    }

    static async getRankedleScores(rankedleId) {
        const scores = await RankedleScores.findAll({
            where: { rankedleId }
        })
        return scores
    }

    static async getRankedleHistory(req, res, page) {
        if(!req.session.user) throw new Error('User not connected')
        const user = req.session.user

        const userId = req.query.userId ?? user.id

        const history = []
        const count = 8

        const { count: total, rows: rankedles } = await Rankedles.findAndCountAll({
            where: {
                date: {
                    [Op.lt]: new Date()
                }
            },
            order: [
                [ 'date', 'desc' ]
            ],
            offset: page * count,
            limit: count,
            raw: true
        })

        for(const rankedle of rankedles) {
            const mapData = await RankedleMaps.findOne({
                where: { id: rankedle.mapId },
                raw: true
            })
    
            const rankedleScore = await RankedleScores.findOne({
                where: {
                    rankedleId: rankedle.id,
                    memberId: userId
                },
                raw: true
            })

            let score = null
            if(rankedleScore) {
                const steps = [ null, null, null, null, null, null ]
                if(rankedleScore.details) {
                    for(let i = 0; i < rankedleScore.details.length; i++) {
                        const detail = rankedleScore.details[i]
                        steps[i] = detail.status
                    }
                }
                if(rankedleScore.success) steps[rankedleScore.skips] = 'success'
                score = [
                    (!rankedleScore.success ? '🔇' : rankedleScore.skips === 0 ? '🔊' : '🔉'),
                    ...steps.map(s => s === 'skip' ? '⬛' : s === 'fail' ? '🟥' : s === 'success' ? '🟩' : '⬜️')
                ]
            }
    
            history.push({
                id: rankedle.id,
                cover: mapData ? mapData.map.versions[mapData.map.versions.length - 1].coverURL : null,
                songName: mapData ? `${mapData.map.metadata.songAuthorName} - ${mapData.map.metadata.songName}${mapData.map.metadata.songSubName !== '' ? ` ${mapData.map.metadata.songSubName}` : ''}`: null,
                levelAuthorName: mapData ? mapData.map.metadata.levelAuthorName: null,
                score: score,
                date: new Intl.DateTimeFormat('FR-fr').format(new Date(rankedle.date))
            })
        }

        res.json({
            page,
            total,
            history
        })
    }
}