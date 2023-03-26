import express from 'express'
import session from 'express-session'
import fileUpload from 'express-fileupload'
import MySQLStore from 'express-mysql-session'
import discord from './controllers/discord.js'
import agent from './controllers/agent.js'
import members from './controllers/members.js'
import city from './controllers/city.js'
import mpov from './controllers/mpov.js'
import youtube from './controllers/youtube.js'
import video from './controllers/video.js'
import nextcloud from './controllers/nextcloud.js'
import feur from './controllers/feur.js'
import { unlink } from 'node:fs/promises'
import fetch from 'node-fetch'
import crypto from 'crypto'
import mmm, { Magic } from 'mmmagic'
import Logger from './utils/logger.js'
import config from './config.json' assert { type: 'json' }

const app = express()
const port = 3020

app.set('view engine', 'ejs')
app.use('/static', express.static('public'))
app.use(express.json({
    type: ['application/json', 'text/plain']
}))

const mysqlStore = MySQLStore(session)
const sessionStore = new mysqlStore({
    connectionLimit: 20,
    host: config.database.host,
    port: config.database.port,
    user: config.database.username,
    password: config.database.password,
    database: 'bsfr_website',
    createDatabaseTable: true
})

app.use(session({
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    secret: config.cookie.secret,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: false,
        path: '/',
        secure: config.cookie.secure,
        httpOnly: false
    }
}))

app.use(fileUpload({
    limits: { fileSize: 3 * 1024 * 1024 * 1024 },
    createParentPath: true,
    preserveExtension: true,
    uploadTimeout: 18000,
    useTempFiles: true,
    tempFileDir: './uploads'
}))

const requireLogin = (req, res, next) => {
    req.session.redirect = req.url
    if(!req.session.discord) {
        res.redirect('/discord/authorize')
    } else {
        if(!req.session.discord.user) {
            res.redirect('/discord/logout')
        } else {
            next()
        }
    }
}

const requireAdmin = (req, res, next) => {
    requireLogin(req, res, () => {
        const user = req.session.discord.user
        if(user.isAdmin) {
            next()
        } else {
            res.status(403).render('errors/403')
        }
    })
}

app.get('/', async (req, res) => {
    req.session.redirect = '/'

    res.render('index.ejs', {
        page: 'accueil',
        user: req.session?.discord?.user ?? null,
        inviteUrl: config.discord.invitation_url
    })
})

app.get('/forms/run/youtube', requireLogin, async (req, res) => {
    const lastVideo = await youtube.getLastVideo()
    res.render('forms/run/youtube.ejs', {
        page: 'youtube',
        user: req.session.discord.user,
        inviteUrl: config.discord.invitation_url,
        lastVideo
    })
})

app.get('/forms/run/mpov', requireLogin, async (req, res) => {
    const mpovInfos = await mpov.getMPOVInfos()
    res.render('forms/run/mpov.ejs', {
        page: 'mpov',
        user: req.session.discord.user,
        inviteUrl: config.discord.invitation_url,
        mpovInfos: mpovInfos
    })
})

app.get('/interactive-map', requireLogin, async (req, res) => {
    res.render('map.ejs', {
        page: 'map',
        user: req.session.discord.user,
        inviteUrl: config.discord.invitation_url
    })
})

app.get('/cities', async (req, res) => {
    if(req.xhr) {
        if(req.session.discord) {
            const cities = await city.get()
            res.json(cities)
            return
        }
    }
    res.status(403).send('Unauthorized')
})

app.get('/guildMembers', async (req, res) => {
    if(req.xhr) {
        if(req.session.discord) {
            const memberList = await members.getGuildMembers(req.session)
            res.json(memberList)
            return
        }
    }
    res.status(403).send('Unauthorized')
})

app.get('/feurboard', requireLogin, async (req, res) => {
    const attackers = await feur.getAttackers(req.session)
    const victims = await feur.getVictims(req.session)

    res.render('feurboard.ejs', {
        page: 'feurboard',
        user: req.session.discord.user,
        inviteUrl: config.discord.invitation_url,
        attackers,
        victims
    })
})

app.get('/admin/', requireAdmin, async (req, res) => {
    res.redirect('/admin/birthdays')
})

app.get('/admin/birthdays', requireAdmin, async (req, res) => {
    const memberList = await members.getGuildMembers(req.session)
    const birthdays = await agent.getBirthdays()
    const membersBirthday = birthdays.map(b => {
        const member = memberList.find(ml => ml.user.id === b.memberId)
        const date = new Intl.DateTimeFormat('fr-FR').format(new Date(b.date))
        return {
            avatar: member ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.webp?size=80` : '',
            name: member ? `${member.user.username}#${member.user.discriminator}` : '',
            date: {
                timestamp: new Date(b.date).getTime(),
                formated: date
            }
        }
    })
    res.render('admin/birthdays', {
        page: 'birthdays',
        user: req.session.discord.user,
        birthdays: membersBirthday
    })
})

app.get('/admin/mutes', requireAdmin, async (req, res) => {
    const memberList = await members.getGuildMembers(req.session)
    const mutes = await agent.getMutes()
    const mutedMembers = await Promise.all(mutes.map(async (m) => {
        const member = memberList.find(ml => ml.user.id === m.memberId) ?? await members.getUser(req.session, m.memberId)
        const author = memberList.find(ml => ml.user.id === m.mutedBy) ?? await members.getUser(req.session, m.mutedBy)
        const muteDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }).format(m.muteDate)
        const unmuteDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }).format(m.unmuteDate)
        return {
            avatar: member ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.webp?size=80` : '',
            name: member ? `${member.user.username}#${member.user.discriminator}` : '',
            author: {
                avatar: author ? `https://cdn.discordapp.com/avatars/${author.user.id}/${author.user.avatar}.webp?size=80` : '',
                name: author ? `${author.user.username}#${author.user.discriminator}` : ''
            },
            reason: m.reason,
            muteDate: {
                timestamp: m.muteDate.getTime(),
                formated: muteDate
            },
            unmuteDate: {
                timestamp: m.unmuteDate.getTime(),
                formated: unmuteDate
            }
        }
    }))
    res.render('admin/mutes', {
        page: 'mutes',
        user: req.session.discord.user,
        mutes: mutedMembers
    })
})

app.get('/admin/bans', requireAdmin, async (req, res) => {
    const memberList = await members.getGuildMembers(req.session)
    const bans = await agent.getBans()
    const bannedMembers = await Promise.all(bans.map(async (b) => {
        const member = memberList.find(ml => ml.user.id === b.memberId) ?? await members.getUser(req.session, b.memberId)
        const author = memberList.find(ml => ml.user.id === b.bannedBy) ?? await members.getUser(req.session, b.bannedBy)
        const banDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }).format(b.banDate)
        const unbanDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }).format(b.unbanDate)
        return {
            avatar: member ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.webp?size=80` : '',
            name: member ? `${member.user.username}#${member.user.discriminator}` : '',
            author: {
                avatar: author ? `https://cdn.discordapp.com/avatars/${author.user.id}/${author.user.avatar}.webp?size=80` : '',
                name: author ? `${author.user.username}#${author.user.discriminator}` : ''
            },
            reason: b.reason,
            banDate: {
                timestamp: b.banDate.getTime(),
                formated: banDate
            },
            unbanDate: {
                timestamp: b.unbanDate.getTime(),
                formated: unbanDate
            }
        }
    }))
    res.render('admin/bans', {
        page: 'bans',
        user: req.session.discord.user,
        bans: bannedMembers
    })
})

app.get('/admin/birthdayMessages', requireAdmin, async (req, res) => {
    const memberList = await members.getGuildMembers(req.session)
    const messageList = await agent.getBirthdayMessages()
    const birthdayMessages = await Promise.all(messageList.map(async (m) => {
        const author = memberList.find(ml => ml.user.id === m.memberId) ?? await members.getUser(req.session, m.memberId)
        const date = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }).format(m.date)
        return {
            id: m.id,
            message: m.message,
            author: {
                avatar: author ? `https://cdn.discordapp.com/avatars/${author.user.id}/${author.user.avatar}.webp?size=80` : '',
                name: author ? `${author.user.username}#${author.user.discriminator}` : ''
            },
            date: {
                timestamp: m.date.getTime(),
                formated: date
            }
        }
    }))
    res.render('admin/birthdayMessages', {
        page: 'birthdayMessages',
        user: req.session.discord.user,
        birthdayMessages: birthdayMessages
    })
})

app.get('/admin/birthdayMessage/:id([0-9]+)', requireAdmin, async (req, res) => {
    try {
        const messageId = parseInt(req.params.id)
        const birthdayMessage = await agent.getBirthdayMessageById(messageId)
        res.json(birthdayMessage)
    } catch(error) {
        res.status(500).json({ error: 'An error occurred' })
    }
})

app.patch('/admin/birthdayMessage/:id([0-9]+)', requireAdmin, async (req, res) => {
    try {
        const messageId = parseInt(req.params.id)
        const message = req.body.message
        await agent.updateBirthdayMessage(messageId, message)
        res.json({ success: true })
    } catch(error) {
        res.status(500).json({ error: 'An error occurred' })
    }
})

app.post('/admin/birthdayMessage', requireAdmin, async (req, res) => {
    try {
        const message = req.body.message
        const user = req.session.discord.user
        await agent.addBirthdayMessage(message, user)
        res.json({ success: true })
    } catch(error) {
        res.status(500).json({ error: 'An error occurred' })
    }
})

app.delete('/admin/birthdayMessage/:id([0-9]+)', requireAdmin, async (req, res) => {
    try {
        const messageId = parseInt(req.params.id)
        await agent.deleteBirthdayMessage(messageId)
        res.json({ success: true })
    } catch(error) {
        res.status(500).json({ error: 'An error occurred' })
    }
})

app.get('/admin/twitchChannels', requireAdmin, async (req, res) => {
    const memberList = await members.getGuildMembers(req.session)
    const channelList = await agent.getTwitchChannels()
    const twitchChannels = await Promise.all(channelList.map(async (c) => {
        const member = memberList.find(ml => ml.user.id === c.memberId)
        return {
            user: {
                avatar: member ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.webp?size=80` : '',
                name: member ? `${member.user.username}#${member.user.discriminator}` : ''
            },
            name: c.channelName,
            isLive: c.live
        }
    }))
    res.render('admin/twitchChannels', {
        page: 'twitchChannels',
        user: req.session.discord.user,
        twitchChannels: twitchChannels
    })
})

app.get('/discord/authorize', (req, res) => {
    const authUrl = 'https://discord.com/api/oauth2/authorize?'
    const state = crypto.randomBytes(10).toString('hex').slice(0, 20)
    const options = new URLSearchParams({
        response_type: 'code',
        client_id: config.discord.client_id,
        scope: 'identify guilds.members.read',
        state: state,
        redirect_uri: config.discord.redirect_uri,
        prompt: 'none'
    }).toString()

    req.session.state = state

    res.redirect(authUrl + options)
})

app.get('/discord/login', async (req, res) => {
    const { code, state } = req.query

    let error = false

    req.session.discord = {
        tokens: null
    }

    if(code && state === req.session.state) {
        const options = new URLSearchParams({
            'client_id': config.discord.client_id,
            'client_secret': config.discord.client_secret,
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': config.discord.redirect_uri
        })

        const exchangeCodeRequest = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: options
        })

        if(exchangeCodeRequest.ok) {
            const tokens = await exchangeCodeRequest.json()
            tokens.expiration_date = Math.floor(new Date().getTime() / 1000) + tokens.expires_in
            req.session.discord.tokens = tokens
            req.session.discord.user = await discord.getCurrentUser(req.session.discord)
        } else {
            error = true
        }
    } else {
        error = true
    }

    if(error) {
        res.redirect('/')
    } else {
        const redirect = req.session.redirect ?? '/'
        delete req.session.redirect
        res.redirect(redirect)
    }
})

app.get('/discord/logout', async (req, res) => {
    if(req.session.discord) {
        await discord.revokeToken(req.session.discord)
        delete req.session.discord
    }
    res.redirect('/')
})

app.post('/forms/run/pc', async (req, res) => {
    const body = req.body
    if(body.url !== null && body.description !== null && body.leaderboard_profil !== null && body.map_leaderboard !== null
        && body.beatsaver !== null && body.headset !== null && body.grip !== null && body.twitch_url !== null && body.comments !== null) {

        const result = await discord.submitRun(req.session.discord, body)

        res.json(result)
    } else {
        res.json({ error: 'Invalid request' })
    }
})

app.post('/forms/run/quest', async (req, res) => {
    const body = req.body    
    if(req?.files?.video && req?.files?.audio && body.description !== null && body.leaderboard_profil !== null && body.map_leaderboard !== null
        && body.beatsaver !== null && body.headset !== null && body.grip !== null && body.twitch_url !== null && body.comments !== null) {

        const videoFile = req.files.video
        const audioFile = req.files.audio
        const user = req.session.discord.user
        const username = `${user.username}#${user.discriminator}`

        const date = Date.now()
        const uploadFilePath = `${process.cwd()}/uploads/youtube`
        const videoFilePath = `${uploadFilePath}/video/${date}-${videoFile.name}`
        const audioFilePath = `${uploadFilePath}/audio/${date}-${audioFile.name}`

        try {
            if(videoFile.size > 3 * 1024 * 1024 * 1024)
                throw new Error('La taille du fichier vidéo ne doit pas exéder 3 Go')

            if(audioFile.size > 3 * 1024 * 1024 * 1024)
                throw new Error('La taille du fichier audio ne doit pas exéder 3 Go')

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
                await discord.submitRun(req.session.discord, body)
            }
        } catch(error) {
            res.send({ success: false, message: error.message })
            return
        }
    } else {
        res.json({ error: 'Invalid request' })
    }
})

app.post('/forms/run/mpov', async (req, res) => {
    if(req?.files?.file) {
        const file = req.files.file
        const user = req.session.discord.user
        const username = `${user.username}#${user.discriminator}`

        try {
            const mpovInfos = await mpov.getMPOVInfos()

            if(Date.now() < mpovInfos.dateStart || Date.now() >= mpovInfos.dateEnd) {
                throw new Error('La soumission de vidéo Multi POV BSFR est fermée')
            } else if(file.mimetype !== 'video/mp4') {
                throw new Error('Le format du fichier sélectionné n\'est pas autorisé')
            } else if(file.size > 3 * 1024 * 1024 * 1024) {
                throw new Error('La taille du fichier ne doit pas exéder 3 Go')
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

app.use(function(req, res) {
    res.status(404).render('errors/404')
})

app.listen(port)