import express from 'express'
import rankedle from '../controllers/rankedle.js'
import { requireLogin } from './middlewares.js'
import config from '../config.json' assert { type: 'json' }

const app = express()

app.get('/', requireLogin, async (req, res) => {
    const user = req.session.user
    const currentRankedle = await rankedle.getCurrentRankedle()
    if(user.isBSFR) {
        const ranking = await rankedle.getRanking()
        const result = await rankedle.getResult(currentRankedle, user.id)
        const isBanned = rankedle.isBanned(user.id)
        res.render('rankedle.ejs', {
            page: 'rankedle',
            user,
            rankedle: currentRankedle,
            ranking,
            result,
            isBanned,
            inviteUrl: config.discord.invitation_url
        })
    } else {
        res.render('rankedle.ejs', {
            page: 'rankedle',
            user,
            rankedle: currentRankedle,
            inviteUrl: config.discord.invitation_url
        })
    }
})

app.get('/song', async (req, res) => {
    try {
        await rankedle.playRequest(req, res)
    } catch(e) {
        res.header('X-Status-Message', e.message)
        res.status(400).end()
    }
})

app.get('/songs', async (req, res) => {
    try {
        const user = req.session.user
        const songs = await rankedle.getSongList(user.id, req.query.q)
        res.json(songs)
    } catch(e) {
        res.header('X-Status-Message', e.message)
        res.status(400).end()
    }
})

app.get('/score', async (req, res) => {
    try {
        await rankedle.scoreRequest(req, res)
    } catch(e) {
        res.header('X-Status-Message', e.message)
        res.status(400).end()
    }
})

app.get('/hint', async (req, res) => {
    try {
        await rankedle.hintRequest(req, res)
    } catch(e) {
        res.header('X-Status-Message', e.message)
        res.status(400).end()
    }
})

app.post('/hint', async (req, res) => {
    try {
        await rankedle.hintRedeem(req, res)
    } catch(e) {
        res.header('X-Status-Message', e.message)
        res.status(400).end()
    }
})

app.post('/skip', async (req, res) => {
    try {
        await rankedle.skipRequest(req, res)
    } catch(e) {
        res.header('X-Status-Message', e.message)
        res.status(400).end()
    }
})

app.post('/submit', async (req, res) => {
    try {
        await rankedle.submitRequest(req, res)
    } catch(e) {
        res.header('X-Status-Message', e.message)
        res.status(400).end()
    }
})

app.get('/share', async (req, res) => {
    try {
        await rankedle.shareRequest(req, res)
    } catch(e) {
        res.header('X-Status-Message', e.message)
        res.status(400).end()
    }
})

app.get('/stats', async (req, res) => {
    try {
        await rankedle.statsRequest(req, res)
    } catch(e) {
        res.header('X-Status-Message', e.message)
        res.status(400).end()
    }
})

app.get('/ranking', async (req, res) => {
    try {
        const ranking = await rankedle.getRanking()
        res.json(ranking)
    } catch(e) {
        res.header('X-Status-Message', e.message)
        res.status(400).end()
    }
})

app.get('/history', async (req, res) => {
    try {
        const page = req.query.page ? parseInt(req.query.page) : 0
        await rankedle.getRankedleHistory(req, res, page)
    } catch(e) {
        res.header('X-Status-Message', e.message)
        res.status(400).end()
    }
})

app.get('/list', async (req, res) => {
    try {
        const rankedleList = await rankedle.getRankedleList()
        res.json(rankedleList)
    } catch(e) {
        res.header('X-Status-Message', e.message)
        res.status(400).end()
    }
})

export default app