import express from 'express'
import crypto from 'crypto'
import DiscordAPI from '../controllers/discord.js'
import config from '../config.json' assert { type: 'json' }
import Logger from '../utils/logger.js'

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

    let error = true

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

            const discord = new DiscordAPI()
            const user = await discord.setToken(token)

            const userData = await discord.getUserData()
            req.session.user = userData

            Logger.log('User', 'INFO', `L'utilisateur ${user.username} s'est connecté`)

            error = false
        }
    }

    if(error) {
        res.redirect('/')
    } else {
        const redirect = req.session.redirect ?? '/'
        delete req.session.state
        delete req.session.redirect
        res.redirect(redirect)
    }
})

app.get('/logout', async (req, res) => {
    const user = req.session.user
    if(user) {
        const discord = new DiscordAPI(user.id)
        await discord.revokeToken()
        await new Promise(res => req.session.destroy(() => {
            res()
        }))
        Logger.log('User', 'INFO', `L'utilisateur ${user.username} s'est déconnecté`)
    }
    res.redirect('/')
})

export default app