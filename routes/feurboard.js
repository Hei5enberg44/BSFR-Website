import express from 'express'
import feur from '../controllers/feur.js'
import { requireLogin } from './middlewares.js'
import config from '../config.json' assert { type: 'json' }

const app = express()

app.get('/', requireLogin, async (req, res) => {
    const attackers = await feur.getAttackers()
    const victims = await feur.getVictims()

    res.render('feurboard.ejs', {
        page: 'feurboard',
        user: req.session.user,
        inviteUrl: config.discord.invitation_url,
        attackers,
        victims
    })
})

app.get('/messages/attacker/:id', async (req, res) => {
    if(req.xhr) {
        if(req.session.user) {
            const messages = await feur.getAttackerMessages(req.params.id)
            res.json(messages)
            return
        }
    }
    res.status(403).send('Unauthorized')
})

app.get('/messages/victim/:id', async (req, res) => {
    if(req.xhr) {
        if(req.session.user) {
            const messages = await feur.getVictimMessages(req.params.id)
            res.json(messages)
            return
        }
    }
    res.status(403).send('Unauthorized')
})

export default app