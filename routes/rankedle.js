import express from 'express'
import rankedle from '../controllers/rankedle.js'
import { requireLogin } from './middlewares.js'
import config from '../config.json' assert { type: 'json' }

const app = express()

app.get('/', requireLogin, async (req, res) => {
    const user = req.session.user
    const currentRankedle = await rankedle.getCurrentRankedle()
    const ranking = await rankedle.getRanking(req.session)
    const result = await rankedle.getResult(currentRankedle, user.id)
    res.render('rankedle.ejs', {
        page: 'rankedle',
        user: req.session.user,
        rankedle: currentRankedle,
        ranking,
        result,
        inviteUrl: config.discord.invitation_url
    })
})

app.get('/song', async (req, res) => {
    try {
        await rankedle.playRequest(req, res)
    } catch(e) {
        res.status(404).end()
    }
})

app.get('/songs', async (req, res) => {
    try {
        const user = req.session.user
        const songs = await rankedle.getSongList(user.id, req.query.q)
        res.json(songs)
    } catch(e) {
        console.log(e)
        res.status(404).end()
    }
})

app.get('/score', async (req, res) => {
    try {
        await rankedle.scoreRequest(req, res)
    } catch(e) {
        res.status(404).end()
    }
})

app.post('/skip', async (req, res) => {
    try {
        await rankedle.skipRequest(req, res)
    } catch(e) {
        res.status(404).end()
    }
})

app.post('/submit', async (req, res) => {
    try {
        await rankedle.submitRequest(req, res)
    } catch(e) {
        res.status(404).end()
    }
})

app.get('/share', async (req, res) => {
    try {
        await rankedle.shareRequest(req, res)
    } catch(e) {
        res.status(404).end()
    }
})

app.get('/stats', async (req, res) => {
    try {
        await rankedle.statsRequest(req, res)
    } catch(e) {
        res.status(404).end()
    }
})

app.get('/history', async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 0
        await rankedle.getRankedleHistory(req, res, page)
    } catch(e) {
        res.status(404).end()
    }
})

export default app