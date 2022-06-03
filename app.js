const cookieSession = require('cookie-session')
const express = require('express')
require('dotenv').config()
const discord = require('./controllers/discord')
const city = require('./controllers/city')
const fetch = require('node-fetch')
const crypto = require('crypto')
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

app.get('/', (req, res) => {
    res.render('index.ejs', {
        error: req.session?.discord?.login_success ? null : 'Échec de connexion'
    })
})

app.get('/forms/run/youtube', async (req, res) => {
    req.session.redirect = req.url
    if(!req.session.discord) {
        res.redirect('/discord/authorize')
    } else {
        const user = req.session.discord.user

        if(!user) {
            res.redirect('/discord/logout')
        } else {
            const loginSuccess = req.session.discord.login_success
            req.session.discord.login_success = null
            res.render('run/index.ejs', {
                success: loginSuccess ? 'Connexion réussie' : null,
                user: user
            })
        }
    }
})

app.get('/interactive-map', async (req, res) => {
    req.session.redirect = req.url
    if(!req.session.discord) {
        res.redirect('/discord/authorize')
    } else {
        const user = req.session.discord.user

        if(!user) {
            res.redirect('/discord/logout')
        } else {
            const loginSuccess = req.session.discord.login_success
            req.session.discord.login_success = null
            res.render('map/index.ejs', {
                success: loginSuccess ? 'Connexion réussie' : null,
                user: user
            })
        }
    }
})

app.get('/cities', async (req, res) => {
    if(req.xhr) {
        const cities = await city.get()
        res.json(cities)
    } else {
        res.status(403).send('Unauthorized')
    }
})

app.get('/guildMembers', async (req, res) => {
    if(req.xhr) {
        const members = await discord.getGuildMembers(req.session.discord)
        res.json(members)
    } else {
        res.status(403).send('Unauthorized')
    }
})

app.get('/discord/authorize', (req, res) => {
    const authUrl = 'https://discord.com/api/oauth2/authorize?'
    const state = crypto.randomBytes(10).toString('hex').slice(0, 20)
    const options = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.DISCORD_CLIENT_ID,
        scope: 'identify guilds.members.read',
        state: state,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
        prompt: 'consent'
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
            'client_id': process.env.DISCORD_CLIENT_ID,
            'client_secret': process.env.DISCORD_CLIENT_SECRET,
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': process.env.DISCORD_REDIRECT_URI
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

    if(error) {
        res.json({ error: 'Invalid request' })
    }
})

app.listen(port)