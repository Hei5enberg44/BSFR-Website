import express from 'express'
import DiscordAPI from '../controllers/discord.js'
import channels from '../controllers/channels.js'
import emojis from '../controllers/emojis.js'
import agent from '../controllers/agent.js'
import { requireAdmin } from './middlewares.js'
import Logger from '../utils/logger.js'

const app = express()

app.get('/', requireAdmin, async (req, res) => {
    res.redirect('/agent/message/send')
})

app.get('/message/send', requireAdmin, async (req, res) => {
    const channelList = await channels.getGuildChannels()
    res.render('agent/message/send', {
        page: 'message_send',
        user: req.session.user,
        channels: channelList
    })
})

app.post('/message/send', requireAdmin, async (req, res) => {
    const { channelId, payload } = req.body
    const discord = new DiscordAPI()
    const response = await discord.sendMessage(channelId, payload)
    res.status(response ? 200 : 500).end()
})

app.get('/message/edit', requireAdmin, async (req, res) => {
    const channelList = await channels.getGuildChannels()
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
    const channelList = await channels.getGuildChannels()
    res.render('agent/reaction/add', {
        page: 'reaction_add',
        user: req.session.user,
        channels: channelList
    })
})

app.post('/reaction/send', requireAdmin, async (req, res) => {
    const { channelId, messageId, emoji } = req.body
    const discord = new DiscordAPI()
    const response = await discord.sendReaction(channelId, messageId, emoji)
    res.status(response ? 200 : 500).end()
})

app.get('/guildEmojis', requireAdmin, async (req, res) => {
    const guildEmojis = await emojis.getGuildEmojis()
    res.json(guildEmojis)
})

app.get('/settings', requireAdmin, async (req, res) => {
    res.redirect('/agent/settings/dm')
})

app.get('/settings/dm', requireAdmin, async (req, res) => {
    const dmSettings = await agent.getSetting('dm')
    res.render('agent/settings/dm', {
        page: 'agent_settings',
        user: req.session.user,
        dmSettings
    })
})

app.post('/settings/dm', requireAdmin, async (req, res) => {
    try {
        const user = req.session.user

        const dmSettings = req.body.dmSettings
        if(!dmSettings) throw new Error('Paramètre "dmSettings" introuvable.')

        await agent.updateSetting('dm', dmSettings)

        Logger.log('AgentSettings', 'SUCCESS', `Les paramètres de DM de @Agent ont été mis à jour par ${user.username}`)
        
        res.end()
    } catch(e) {
        res.header('X-Status-Message', e.message)
        res.status(400).end()
    }
})

export default app