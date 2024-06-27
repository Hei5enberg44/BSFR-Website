import express from 'express'
import DiscordAPI from '../controllers/discord.js'
import video from '../controllers/video.js'
import nextcloud from '../controllers/nextcloud.js'
import mpov from '../controllers/mpov.js'
import youtube from '../controllers/youtube.js'
import { requireLogin } from './middlewares.js'
import { unlink } from 'node:fs/promises'
import mmm, { Magic } from 'mmmagic'
import Logger from '../utils/logger.js'
import config from '../config.json' assert { type: 'json' }

const app = express()

app.get('/run/youtube', requireLogin, async (req, res) => {
    const lastVideo = await youtube.getLastVideo()
    res.render('forms/run/youtube.ejs', {
        page: 'youtube',
        user: req.session.user,
        inviteUrl: config.discord.invitation_url,
        lastVideo
    })
})

app.get('/run/mpov', requireLogin, async (req, res) => {
    const mpovInfos = await mpov.getMPOVInfos()
    res.render('forms/run/mpov.ejs', {
        page: 'mpov',
        user: req.session.user,
        inviteUrl: config.discord.invitation_url,
        mpovInfos
    })
})

app.post('/run/pc', requireLogin, async (req, res) => {
    const body = req.body
    if(body.url !== null && body.description !== null && body.leaderboard_profil !== null && body.map_leaderboard !== null
        && body.beatsaver !== null && body.headset !== null && body.grip !== null && body.twitch_url !== null && body.comments !== null) {

        const user = req.session.user
        const discord = new DiscordAPI(user.id)
        const result = await discord.submitRun(user, body)

        res.json(result)
    } else {
        res.json({ error: 'Invalid request' })
    }
})

app.post('/run/quest', requireLogin, async (req, res) => {
    const body = req.body    
    if(req?.files?.video && req?.files?.audio && body.description !== null && body.leaderboard_profil !== null && body.map_leaderboard !== null
        && body.beatsaver !== null && body.headset !== null && body.grip !== null && body.twitch_url !== null && body.comments !== null) {

        const videoFile = req.files.video
        const audioFile = req.files.audio
        const user = req.session.user
        const username = user.username

        const date = Date.now()
        const uploadFilePath = `${process.cwd()}/uploads/youtube`
        const videoFilePath = `${uploadFilePath}/video/${date}-${videoFile.name}`
        const audioFilePath = `${uploadFilePath}/audio/${date}-${audioFile.name}`

        try {
            if(videoFile.size > 2 * 1024 * 1024 * 1024)
                throw new Error('La taille du fichier vidéo ne doit pas exéder 2 Go')

            if(audioFile.size > 2 * 1024 * 1024 * 1024)
                throw new Error('La taille du fichier audio ne doit pas exéder 2 Go')

            await videoFile.mv(videoFilePath)
            await audioFile.mv(audioFilePath)

            // Contrôle des types de fichiers
            const magic = new Magic(mmm.MAGIC_MIME_TYPE)
            const videoType = await new Promise((res, rej) => {
                magic.detectFile(videoFilePath, function(err, result) {
                    if(err) rej('Une erreur est survenue lors de l\'analyse du fichier vidéo')
                    res(result)
                })
            })

            const audioType = await new Promise((res, rej) => {
                magic.detectFile(audioFilePath, function(err, result) {
                    if(err) rej('Une erreur est survenue lors de l\'analyse du fichier audio')
                    res(result)
                })
            })

            if((videoType !== 'video/h264' && videoType !== 'application/octet-stream') || audioType !== 'audio/x-wav') {
                await unlink(videoFilePath)
                await unlink(audioFilePath)

                if(videoType !== 'video/h264' && videoType !== 'application/octet-stream') throw new Error('Le format du fichier vidéo n\'est pas autorisé')
                if(audioType !== 'audio/x-wav') throw new Error('Le format du fichier audio n\'est pas autorisé')
            }

            Logger.log('YouTubeRun', 'SUCCESS', `La run de ${username} a bien été uploadée`)
            res.send({ success: true, message: 'La run a bien été envoyée' })

            const mergedVideoFile = `${date}-${username}.mp4`
            const mergedVideoPath = `${uploadFilePath}/${mergedVideoFile}`
            await video.merge(videoFilePath, audioFilePath, mergedVideoPath)
            await video.uploadFile(mergedVideoPath, 'BSFR/Runs YouTube')
            const shareUrl = await nextcloud.shareFile(`BSFR/Runs YouTube/${mergedVideoFile}`)
    
            if(shareUrl) {
                body.url = shareUrl
                const user = req.session.user
                const discord = new DiscordAPI(user.id)
                await discord.submitRun(user, body)
            }
        } catch(error) {
            res.send({ success: false, message: error.message })
            return
        }
    } else {
        res.json({ error: 'Invalid request' })
    }
})

app.post('/run/mpov', async (req, res) => {
    if(req?.files?.file) {
        const file = req.files.file
        const user = req.session.user
        const username = user.username

        try {
            const mpovInfos = await mpov.getMPOVInfos()

            if(Date.now() < mpovInfos.dateStart || Date.now() >= mpovInfos.dateEnd) {
                throw new Error('La soumission de vidéo Multi POV BSFR est fermée')
            } else if(file.mimetype !== 'video/mp4') {
                throw new Error('Le format du fichier sélectionné n\'est pas autorisé')
            } else if(file.size > 2 * 1024 * 1024 * 1024) {
                throw new Error('La taille du fichier ne doit pas exéder 2 Go')
            }

            await new Promise((resolve, reject) => {
                file.mv(`./uploads/mpov/${username}/${file.name}`, (err) => {
                    if(err) {
                        reject(err.message)
                    } else {
                        resolve()
                    }
                })
            })

            Logger.log('MultiPOV', 'SUCCESS', `La run de ${username} a bien été uploadée`)
            res.send({ success: true, message: 'Le fichier a bien été envoyé' })
        } catch(error) {
            res.send({ success: false, message: error.message })
        }
    } else {
        res.json({ error: 'Invalid request' })
    }
})

export default app