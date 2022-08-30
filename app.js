const cookieSession = require('cookie-session')
const express = require('express')
const fileUpload = require('express-fileupload')
const discord = require('./controllers/discord')
const city = require('./controllers/city')
const mpov = require('./controllers/mpov')
const fetch = require('node-fetch')
const crypto = require('crypto')
const Logger = require('./utils/logger')
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

app.use(fileUpload({
    limits: { fileSize: 3 * 1024 * 1024 * 1024 },
    createParentPath: true,
    preserveExtension: true,
    uploadTimeout: 18000,
    useTempFiles: true,
    tempFileDir: './uploads'
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
    const body = req.body
    if(body.url !== null && body.description !== null && body.leaderboard_profil !== null && body.map_leaderboard !== null
        && body.beatsaver !== null && body.headset !== null && body.grip !== null && body.twitch_url !== null && body.comments !== null) {

        const result = await discord.submitRun(req.session.discord, body)

        res.json(result)
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
                file.mv(`./uploads/${username}/${file.name}`, (err) => {
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

app.listen(port)