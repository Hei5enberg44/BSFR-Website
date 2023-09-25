import express from 'express'
import rankdle from '../controllers/rankdle.js'
import { requireLogin, requireAdmin } from './middlewares.js'
import config from '../config.json' assert { type: 'json' }

const app = express()

app.get('/', requireAdmin, async (req, res) => {
    try {
        const result = await rankdle.getResult(req, res)
        res.render('rankdle.ejs', {
            page: 'rankdle',
            user: req.session.user,
            result,
            inviteUrl: config.discord.invitation_url
        })
    } catch(e) {
        const currentRankdle = await rankdle.getCurrentRankdle()
        res.render('rankdle.ejs', {
            page: 'rankdle',
            user: req.session.user,
            rankdle: currentRankdle,
            inviteUrl: config.discord.invitation_url
        })
    }
})

app.get('/song', async (req, res) => {
    try {
        await rankdle.playRequest(req, res)
    } catch(e) {
        res.status(404).end()
    }
})

app.get('/songs', async (req, res) => {
    try {
        const songs = await rankdle.getSongList(req.query.q)
        res.json(songs)
    } catch(e) {
        console.log(e)
        res.status(404).end()
    }
})

app.get('/score', async (req, res) => {
    try {
        await rankdle.scoreRequest(req, res)
    } catch(e) {
        res.status(404).end()
    }
})

app.post('/skip', async (req, res) => {
    try {
        await rankdle.skipRequest(req, res)
    } catch(e) {
        res.status(404).end()
    }
})

app.post('/submit', async (req, res) => {
    try {
        await rankdle.submitRequest(req, res)
    } catch(e) {
        res.status(404).end()
    }
})

export default app