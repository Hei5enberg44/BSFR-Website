import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'url'
import { createCanvas, loadImage } from 'canvas'
import sharp from 'sharp'
import ffmpeg from 'fluent-ffmpeg'
import yauzl from 'yauzl'
import tmp from 'tmp'
import { Sequelize, Op } from 'sequelize'
import members from './members.js'
import DiscordAPI from './discord.js'
import { Rankedles, RankedleSeasons, RankedleMaps, RankedleScores, RankedleStats, RankedleMessages } from './database.js'
import mime from '../utils/mime.js'
import Logger from '../utils/logger.js'
import config from '../config.json' assert { type: 'json' }

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const RANKEDLE_PATH = path.resolve(__dirname, '../rankedle')
const EGG_PATH = path.join(RANKEDLE_PATH, 'song.egg')
const WEBM_PATH = path.join(RANKEDLE_PATH, 'song.mp3')
const TRIMED_WEBM_PATH = path.join(RANKEDLE_PATH, 'preview_full.mp3')
const BITRATE = 96
const RANGES = [
    '00:01',
    '00:02',
    '00:04',
    '00:07',
    '00:11',
    '00:16'
]
const POINTS = [ 8, 6, 4, 3, 2, 1, 0 ]

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
            .outputOptions([
                '-codec:a libmp3lame',
                '-b:a 128k',
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
            .addOutputOption(`-ss ${from}`)
            .addOutputOption(`-t ${duration}`)
            .addOption('-c copy')
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
                await this.trimSilence(EGG_PATH, WEBM_PATH)
        
                // Get time range
                const dataTrimed = await this.getSongMetaData(WEBM_PATH)
                const duration = Math.floor(dataTrimed.format.duration)
                const start = duration >= 30 ? Math.round(Math.random() * (duration - 30)) : 0
        
                // Trim song
                await this.trim(WEBM_PATH, TRIMED_WEBM_PATH, start)

                for(let i = 0; i < RANGES.length; i++) {
                    await this.trim(TRIMED_WEBM_PATH, path.join(RANKEDLE_PATH, `preview_${i}.mp3`), '00:00', RANGES[i])
                }

                const seasonId = await this.getCurrentSeason()

                await Rankedles.create({ mapId: mapId, seasonId })
            }
        } catch(e) {
            Logger.log('Rankedle', 'ERROR', `Imposible de générer une Rankedle pour la map (${e.message})`)
        }
    }

    static async getCurrentSeason() {
        const seasons = await RankedleSeasons.findAll({
            order: [
                [ 'id', 'desc' ]
            ],
            limit: 1
        })
        // if(seasons.length === 0) {
        //     const dateStart = new Date()
        //     dateStart.setHours(0, 0, 0, 0)
        //     const dateEnd = new Date()
        //     dateEnd.setDate(dateEnd.getDate() + 100)
        //     dateEnd.setHours(0, 0, 0, 0)
        //     const season = await RankedleSeasons.create({
        //         dateStart,
        //         dateEnd
        //     })
        //     return season.id
        // }
        return seasons[0].id
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
        const seasonId = await this.getCurrentSeason()
        const stats = await RankedleStats.findOne({
            where: { memberId, seasonId }
        })
        return stats
    }

    static isBanned(memberId) {
        const blacklist = [ '1125101235087872010' ]
        return blacklist.includes(memberId)
    }

    static async playRequest(req, res) {
        if(!req.session.user) throw new Error('User not connected')
        const user = req.session.user

        const rankedle = await this.getCurrentRankedle()
        if(!rankedle) throw new Error('No rankedle found')

        const rankedleScore = await this.getUserScore(rankedle.id, user.id)
        await this.setDateStart(rankedle.id, user.id, rankedleScore)

        const skips = rankedleScore ? rankedleScore.skips : 0
        const fileName = `preview_${skips < 6 && !rankedleScore?.success ? skips : 'full'}.mp3`
        const preview = path.join(RANKEDLE_PATH, fileName)

        const stat = fs.statSync(preview)
        const fileSize = stat.size

        const file = fs.createReadStream(preview)
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'audio/mp3',
            'Cache-Controle': 'max-age=0, no-cache, no-store, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Pad': 'avoid browser bug',
            'ETag': fileName
        }

        res.writeHead(200, head)
        file.pipe(res)
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

    static async blurImage(url) {
        const canvas = createCanvas(300, 300)
        const ctx = canvas.getContext('2d')
        const songCover = await loadImage(url)
        ctx.filter = 'blur(20px)'
        ctx.drawImage(songCover, 0, 0, 300, 300)
        const image = await sharp(canvas.toBuffer()).blur(10).webp({ quality: 100 }).toBuffer()
        return image
    }

    static async hintRedeem(req, res) {
        if(!req.session.user) throw new Error('User not connected')
        const user = req.session.user

        const rankedle = await this.getCurrentRankedle()
        if(!rankedle) throw new Error('No rankedle found')

        const rankedleScore = await this.getUserScore(rankedle.id, user.id)
        if(rankedleScore?.skips !== 5) throw new Error('Action impossible')

        if(!rankedleScore.hint) {
            rankedleScore.hint = true
            await rankedleScore.save()
        }

        const mapData = await RankedleMaps.findOne({
            where: { id: rankedle.mapId },
            raw: true
        })
        const coverURL = mapData.map.versions[mapData.map.versions.length - 1].coverURL
        const coverBuffer = await this.blurImage(coverURL)
        const cover = coverBuffer.toString('base64')
        res.json({ cover })
    }

    static async skipRequest(req, res) {
        if(!req.session.user) throw new Error('User not connected')
        const user = req.session.user

        const rankedle = await this.getCurrentRankedle()
        if(!rankedle) throw new Error('No rankedle found')

        if(this.isBanned(user.id)) throw new Error('Action impossible')

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

        if(score.dateEnd === null && score.success !== null) {
            await this.updatePlayerStats(rankedle, score)
            await this.updateRankedland()
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

        if(this.isBanned(user.id)) throw new Error('Action impossible')

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
                    score.messageId = score.skips === 0 ? await this.getRandomMessage('first_try') : await this.getRandomMessage('won')
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

        if(score.dateEnd === null && score.success !== null) {
            await this.updatePlayerStats(rankedle, score)
            await this.updateRankedland()
        }

        res.json(score)
    }

    static async updatePlayerStats(rankedle, score) {
        await this.setDateEnd(score)

        const stats = await RankedleStats.findOne({
            where: {
                seasonId: rankedle.seasonId,
                memberId: score.memberId
            }
        })

        if(stats) {
            stats.played++
            if(score.success) {
                stats[`try${score.skips + 1}`]++
                stats.won++
                stats.currentStreak++
                if(stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak
                stats.points += POINTS[score.skips]
            } else {
                stats.currentStreak = 0
            }
            await stats.save()
        } else {
            const stats = {
                seasonId: rankedle.seasonId,
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
                maxStreak: 0,
                points: 0
            }
            if(score.success) {
                stats[`try${score.skips + 1}`] = 1
                stats.won = 1
                stats.currentStreak = 1
                stats.maxStreak = 1
                stats.points += POINTS[score.skips]
            }
            await RankedleStats.create(stats)
        }
    }

    static async updateRankedland() {
        const VIEW_CHANNEL = 1 << 10

        const rankedle = await this.getCurrentRankedle()
        
        if(rankedle) {
            // Permissions par défaut du salon
            const permissions = [
                {
                    id: config.discord.roles['everyone'],
                    type: 0,
                    deny: VIEW_CHANNEL.toString()
                },
                {
                    id: config.discord.roles['Admin'],
                    type: 0,
                    allow: VIEW_CHANNEL.toString()
                }
            ]

            // Ajout de chaque joueur ayant terminé le Rankedle du jour aux permissions du salon
            const scores = await this.getRankedleScores(rankedle.id)
            const finishedScores = scores.filter(s => s.success !== null)
            for(const score of finishedScores) {
                permissions.push({
                    id: score.memberId,
                    type: 1,
                    allow: VIEW_CHANNEL.toString()
                })
            }

            const payload = { permission_overwrites: permissions }

            try {
                const discord = new DiscordAPI()
                await discord.updateChannel(config.discord.channels['rankedland'], payload)
            } catch(error) {
                console.log(error)
                Logger.log('Échec de mise à jour des permissions pour le channel #rankedland')
            }
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
                steps[i] = detail.status
            }
        }
        if(rankedleScore.success) steps[rankedleScore.skips] = 'success'
        const score = [
            (!rankedleScore.success ? '🔇' : rankedleScore.skips === 0 ? '🔊' : '🔉'),
            ...steps.map(s => s === 'skip' ? '⬛' : s === 'fail' ? '🟥' : s === 'success' ? '🟩' : '⬜')
        ]

        return {
            won: rankedleScore.success,
            skips: rankedleScore.skips,
            score,
            points: POINTS[rankedleScore.skips],
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
        result += [
            (!rankedleScore.success ? '🔇' : rankedleScore.skips === 0 ? '🔊' : '🔉'),
            ...steps.map(s => s === 'skip' ? '⬛' : s === 'fail' ? '🟥' : s === 'success' ? '🟩' : '⬜')
        ].join(' ') + '\n\n'
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
        const seasonId = await this.getCurrentSeason()
        const rankingList = await RankedleStats.findAll({
            where: { seasonId },
            attributes: [
                'memberId',
                'played',
                'won',
                'currentStreak',
                'maxStreak',
                'points'
            ],
            order: [
                [ 'points', 'desc' ]
            ],
            raw: true
        })

        let rank = 0
        const ranking = []
        for(const player of rankingList) {
            const user = await members.getUser(player.memberId)
            if(!user) continue

            rank = ([...ranking].pop())?.points === player.points ? rank : rank + 1
            player.avatar = `${user.getAvatarURL()}?size=80`
            player.name = user.username
            player.rank = rank
            ranking.push(player)
        }

        return ranking
    }

    static async finish() {
        const rankedle = await this.getLastRankedle()
        
        if(rankedle) {
            const scores = await this.getRankedleScores(rankedle.id)
            const unfinishedScores = scores.filter(s => s.success === null)

            for(const score of unfinishedScores) {
                if(score.skips > 0) {
                    score.success = false
                    await score.save()
                }
                await this.updatePlayerStats(rankedle, score)
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
                    ...steps.map(s => s === 'skip' ? '⬛' : s === 'fail' ? '🟥' : s === 'success' ? '🟩' : '⬜')
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

    static async getSummary() {
        const globalStatsData = await RankedleStats.findAll({
            attributes: [
                'memberId',
                [ Sequelize.fn('sum', Sequelize.col('points')), 'totalPoints' ]
            ],
            group: 'memberId',
            raw: true
        })

        const globalStats = []
        for(const s of globalStatsData) {
            const user = await members.getUser(s.memberId)
            if(!user) continue
            globalStats.push({
                ...s,
                player: {
                    name: user.username,
                    avatar: `${user.getAvatarURL()}?size=80`
                }
            })
        }

        // Classement général
        globalStats.sort((a, b) => b.totalPoints - a.totalPoints)

        let rank = 0
        const ranking = []
        for(const stat of globalStats) {
            rank = ([...ranking].pop())?.points === stat.totalPoints ? rank : rank + 1
            ranking.push({
                player: stat.player,
                points: stat.totalPoints,
                rank
            })
        }

        let season = null

        const seasons = await RankedleSeasons.findAll({
            order: [
                [ 'id', 'desc' ]
            ],
            raw: true
        })
        const prevSeason = seasons.length > 1 ? seasons[seasons.length - 1] : null

        if(prevSeason) {
            const seasonId = prevSeason.id

            const seasonStatsData = await RankedleStats.findAll({
                where: { seasonId },
                raw: true
            })

            if(seasonStatsData.length > 0) {
                const seasonStats = []
                for(const s of seasonStatsData) {
                    const user = await members.getUser(s.memberId)
                    if(!user) continue
                    seasonStats.push({
                        ...s,
                        player: {
                            name: user.username,
                            avatar: `${user.getAvatarURL()}?size=80`
                        }
                    })
                }

                const seasonScores = await RankedleScores.findAll({
                    include: {
                        model: Rankedles,
                        required: false,
                        attributes: []
                    },
                    attributes: [
                        'memberId',
                        [ Sequelize.fn('sum', Sequelize.col('skips')), 'totalSkips' ],
                        [ Sequelize.fn('sum', Sequelize.col('hint')), 'totalHints' ]
                    ],
                    where: {
                        '$rankedle.seasonId$': seasonId
                    },
                    group: 'memberId',
                    raw: true
                })
        
                const scores = []
                for(const s of seasonScores) {
                    const user = await members.getUser(s.memberId)
                    scores.push({
                        ...s,
                        player: {
                            name: user ? user.username : s.memberId,
                            avatar: user ? `${user.getAvatarURL()}?size=80` : ''
                        }
                    })
                }

                // Top 1
                seasonStats.sort((a, b) => b.points - a.points)
                const top1 = seasonStats[0].points > 0 ? {
                    player: seasonStats[0].player,
                    count: seasonStats[0].points
                } : null

                // Meilleure série
                seasonStats.sort((a, b) => b.maxStreak - a.maxStreak)
                const maxStreak = seasonStats[0].maxStreak > 0 ? {
                    player: seasonStats[0].player,
                    count: seasonStats[0].maxStreak
                } : null

                // Parties jouées
                seasonStats.sort((a, b) => b.played - a.played)
                const played = seasonStats[0].played > 0 ? {
                    player: seasonStats[0].player,
                    count: seasonStats[0].played
                } : null

                // Du premier coup
                seasonStats.sort((a, b) => b.try1 - a.try1)
                const firstTry = seasonStats[0].try1 > 0 ? {
                    player: seasonStats[0].player,
                    count: seasonStats[0].try1
                } : null

                // Nombre de victoires
                seasonStats.sort((a, b) => b.won - a.won)
                const wins = seasonStats[0].won > 0 ? {
                    player: seasonStats[0].player,
                    count: seasonStats[0].won
                } : null

                // Nombre de défaites
                seasonStats.sort((a, b) => (b.played - b.won) - (a.played - a.won))
                const loses = seasonStats[0].played - seasonStats[0].won > 0 ? {
                    player: seasonStats[0].player,
                    count: seasonStats[0].played - seasonStats[0].won
                } : null

                // Clics du bouton « PASSER »
                scores.sort((a, b) => b.totalSkips - a.totalSkips)
                const skips = scores[0].totalSkips > 0 ? {
                    player: scores[0].player,
                    count: scores[0].totalSkips
                } : null

                // Nombre d'indices demandés
                scores.sort((a, b) => b.totalHints - a.totalHints)
                const hints = scores[0].totalHints > 0 ? {
                    player: scores[0].player,
                    count: scores[0].totalHints
                } : null

                season = {
                    id: seasonId,
                    top1,
                    maxStreak,
                    played,
                    firstTry,
                    wins,
                    loses,
                    skips,
                    hints
                }
            }
        }

        return {
            global: {
                ranking
            },
            season
        }
    }
}