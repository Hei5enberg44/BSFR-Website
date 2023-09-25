import express from 'express'
import discord from '../controllers/discord.js'
import channels from '../controllers/channels.js'
import { requireAdmin } from './middlewares.js'

const app = express()

app.get('/', requireAdmin, async (req, res) => {
    res.redirect('/agent/message/send')
})

app.get('/message/send', requireAdmin, async (req, res) => {
    const channelList = await channels.getGuildChannels(req.session)
    res.render('agent/message/send', {
        page: 'message_send',
        user: req.session.user,
        channels: channelList
    })
})

app.post('/message/send', requireAdmin, async (req, res) => {
    const { channel, payload } = req.body
    const response = await discord.sendMessage(req.session.discord, channel, payload)
    res.status(response ? 200 : 500).end()
})

app.get('/message/edit', requireAdmin, async (req, res) => {
    const channelList = await channels.getGuildChannels(req.session)
    res.render('agent/message/edit', {
        page: 'message_edit',
        user: req.session.user,
        channels: channelList
    })
})

app.get('/message/get', requireAdmin, async (req, res) => {
    const { channelId, messageId } = req.query
    const message = await discord.getBotMessage(req.session.discord, channelId, messageId)
    if(message) {
        res.json(message)
    } else {
        res.send(500).end()
    }
})

app.get('/reaction/add', requireAdmin, async (req, res) => {
    res.render('agent/reaction/add', {
        page: 'reaction_add',
        user: req.session.user
    })
})

export default app