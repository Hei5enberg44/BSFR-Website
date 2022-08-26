const cookieSession = require('cookie-session')
const express = require('express')
const discord = require('./controllers/discord')
const city = require('./controllers/city')
const webdav = require('./controllers/webdav')
const mpov = require('./controllers/mpov')
const fetch = require('node-fetch')
const crypto = require('crypto')
const multer = require('multer')
const Logger = require('./utils/logger')
const fs = require('node:fs')
const config = require('./config.json')

const app = express()
const port = 3020

app.set('view engine', 'ejs')
app.use('/static', express.static('public'))
app.use(express.json({
    type: ['application/json', 'text/plain']
}))

app.use(cookieSession({
    name: 'session',
    keys: [ '0iiCr1etoh6sMsoi' ],
    maxAge: 24 * 60 * 60 * 1000
}))

const requireLogin = function(req, res, next) {
    req.session.redirect = req.url
    if(!req.session.discord) {
        res.redirect('/discord/authorize')
    } else {
        if(!req.session.discord.user) {
            res.redirect('/discord/logout')
        } else {
            if(req.session.discord.login_success !== null) {
                req.login_sucess = req.session.discord.login_success
                req.session.discord.login_success = null
            }
            next()
        }
    }
}

app.get('/', async (req, res) => {
    if(req.session.discord) {
        req.login_sucess = req.session.discord.login_success ?? null
        if(req.login_sucess === false) delete req.session.discord
    }

    const guild = await discord.getGuildPreview()
    res.render('index.ejs', {
        login_success: req.login_sucess ?? null,
        guild: guild,
        inviteUrl: config.discord.invitation_url
    })
})

app.get('/forms/run/youtube', requireLogin, async (req, res) => {
    res.render('run/index.ejs', {
        login_success: req.login_sucess ?? null,
        user: req.session.discord.user,
        inviteUrl: config.discord.invitation_url
    })
})

app.get('/forms/run/mpov', requireLogin, async (req, res) => {
    const mpovInfos = await mpov.getMPOVInfos()
    res.render('mpov/index.ejs', {
        login_success: req.login_sucess ?? null,
        user: req.session.discord.user,
        inviteUrl: config.discord.invitation_url,
        mpovInfos: mpovInfos
    })
})

app.get('/interactive-map', requireLogin, async (req, res) => {
    res.render('map/index.ejs', {
        login_success: req.login_sucess ?? null,
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
            const members = await discord.getGuildMembers(req.session.discord)
            res.json(members)
            return
        }
    }
    res.status(403).send('Unauthorized')
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
        login_success: true,
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
        req.session.discord.login_success = false
        res.redirect('/')
    } else {
        res.redirect(req.session.redirect)
    }
})

app.get('/discord/logout', async (req, res) => {
    if(req.session.discord) {
        await discord.revokeToken(req.session.discord)
        delete req.session.discord
    }

    res.redirect('/')
})

app.post('/forms/run/youtube', async (req, res) => {
    let error = true

    const body = req.body
    if(body.url !== null && body.description !== null && body.scoresaber_profil !== null && body.scoresaber_leaderboard !== null
        && body.beatsaver !== null && body.headset !== null && body.grip !== null && body.twitch_url !== null && body.comments !== null) {
        error = false

        const result = await discord.submitRun(req.session.discord, body)

        res.json(result)
    }

    if(error) res.json({ error: 'Invalid request' })
})

const mpovUpload = multer({
    dest: './uploads/',
    fileFilter: async (req, file, cb) => {
        let error = true
        const fileSize = req.headers['content-length']
        const mpovInfos = await mpov.getMPOVInfos()
        if(Date.now() < mpovInfos.dateStart || Date.now() >= mpovInfos.dateEnd) {
            req.fileValidationError = 'La soumission de vidéo Multi POV BSFR est fermée'
        } else if(file.mimetype !== 'video/mp4') {
            req.fileValidationError = 'Le format du fichier sélectionné n\'est pas autorisé'
        } else if(fileSize > 3 * 1024 * 1024 * 1024) {
            req.fileValidationError = 'La taille du fichier ne doit pas exéder 3 Go'
        } else { error = false }
        cb(null, !error)
    }
})

app.post('/forms/run/mpov', mpovUpload.single('file'), (req, res) => {
    const error = req.fileValidationError
    if(error) {
        res.json({ success: false, message: error })
    } else if(!req.file) {
        res.json({ error: 'Invalid request' })
    } else {
        const token = crypto.randomBytes(10).toString('hex').slice(0, 20)
        req.session.uploadToken = token
        res.json({ success: true, message: 'Le fichier a bien été envoyé', file: req.file, token: token })
    }
})

app.post('/forms/run/mpov/upload', async (req, res) => {
    let error = true

    if(req.session.uploadToken && req.body.file && req.body.token) {
        if(req.body.token === req.session.uploadToken) {
            error = false

            const file = req.body.file
            const user = req.session.discord.user

            delete req.session.uploadToken

            try {
                Logger.log('MultiPOV', 'INFO', `Upload de la run de ${user.username} dans le drive`)

                await webdav.createFolder(config.nextcloud.mpov_location + '/' + user.username)
                await webdav.uploadFile(fs.createReadStream(file.destination + file.filename), config.nextcloud.mpov_location + '/' + user.username + '/' + file.originalname)
                fs.unlinkSync(file.destination + '/' + file.filename)
                
                Logger.log('MultiPOV', 'SUCCESS', `La run de ${user.username} a bien été uploadée dans le drive`)

                res.json({ success: true, message: 'La run a bien été envoyée' })
            } catch(error) {
                fs.unlinkSync(file.destination + '/' + file.filename)

                Logger.log('MultiPOV', 'ERROR', `L'upload de la run de ${user.username} dans le drive a échouée`)

                res.json({ success: false, message: 'Erreur lors de l\'upload de la run sur le drive' })
            }
        }
    }

    if(error) res.json({ error: 'Invalid request' })
})

app.listen(port)