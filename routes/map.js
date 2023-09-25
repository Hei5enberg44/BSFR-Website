import express from 'express'
import { requireLogin } from './middlewares.js'
import config from '../config.json' assert { type: 'json' }

const app = express()

app.get('/', requireLogin, async (req, res) => {
    res.render('map.ejs', {
        page: 'map',
        user: req.session.user,
        inviteUrl: config.discord.invitation_url
    })
})

export default app