import express from 'express'
import crypto from 'crypto'
import DiscordAPI from '../controllers/discord.js'
import config from '../config.json' assert { type: 'json' }

const app = express()

app.get('/authorize', (req, res) => {
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

app.get('/login', async (req, res) => {
    const { code, state } = req.query

    let error = false

    if(code && state === req.session.state) {
        const options = new URLSearchParams({
            client_id: config.discord.client_id,
            client_secret: config.discord.client_secret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: config.discord.redirect_uri
        })

        const exchangeCodeRequest = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: options
        })

        if(exchangeCodeRequest.ok) {
            const token = await exchangeCodeRequest.json()

            const discord = new DiscordAPI(req.session)
            await discord.setToken(token)

            const user = await discord.getCurrentUser()
            req.session.user = user
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

app.get('/logout', async (req, res) => {
    if(req.session.token) {
        const discord = new DiscordAPI(req.session)
        await discord.revokeToken()
    }
    res.redirect('/')
})

export default app