import express from 'express'
import agent from '../controllers/agent.js'
import members from '../controllers/members.js'
import { requireAdmin } from './middlewares.js'

const app = express()

app.get('/', requireAdmin, async (req, res) => {
    res.redirect('/admin/birthdays')
})

app.get('/birthdays', requireAdmin, async (req, res) => {
    const memberList = await members.getGuildMembers()
    const birthdays = await agent.getBirthdays()
    const membersBirthday = birthdays.map(b => {
        const member = memberList.find(ml => ml.user.id === b.memberId)
        const date = new Intl.DateTimeFormat('fr-FR').format(new Date(b.date))
        return {
            avatar: member ? `${members.getAvatar(member.user)}?size=80` : '',
            name: member ? `${member.user.username}#${member.user.discriminator}` : '',
            date: {
                timestamp: new Date(b.date).getTime(),
                formated: date
            }
        }
    })
    res.render('admin/birthdays', {
        page: 'birthdays',
        user: req.session.user,
        birthdays: membersBirthday
    })
})

app.get('/mutes', requireAdmin, async (req, res) => {
    const memberList = await members.getGuildMembers()
    const mutes = await agent.getMutes()
    const mutedMembers = await Promise.all(mutes.map(async (m) => {
        const member = memberList.find(ml => ml.user.id === m.memberId) ?? await members.getUser(m.memberId)
        const author = memberList.find(ml => ml.user.id === m.mutedBy) ?? await members.getUser(m.mutedBy)
        const muteDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }).format(m.muteDate)
        const unmuteDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }).format(m.unmuteDate)
        return {
            avatar: member ? `${members.getAvatar(member.user)}?size=80` : '',
            name: member ? `${member.user.username}#${member.user.discriminator}` : '',
            author: {
                avatar: author ? `${members.getAvatar(author.user)}?size=80` : '',
                name: author ? `${author.user.username}#${author.user.discriminator}` : ''
            },
            reason: m.reason,
            muteDate: {
                timestamp: m.muteDate.getTime(),
                formated: muteDate
            },
            unmuteDate: {
                timestamp: m.unmuteDate.getTime(),
                formated: unmuteDate
            }
        }
    }))
    res.render('admin/mutes', {
        page: 'mutes',
        user: req.session.user,
        mutes: mutedMembers
    })
})

app.get('/bans', requireAdmin, async (req, res) => {
    const memberList = await members.getGuildMembers()
    const bans = await agent.getBans()
    const bannedMembers = await Promise.all(bans.map(async (b) => {
        const member = memberList.find(ml => ml.user.id === b.memberId) ?? await members.getUser(b.memberId)
        const author = memberList.find(ml => ml.user.id === b.bannedBy) ?? await members.getUser(b.bannedBy)
        const banDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }).format(b.banDate)
        const unbanDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }).format(b.unbanDate)
        return {
            avatar: member ? `${members.getAvatar(member.user)}?size=80` : '',
            name: member ? `${member.user.username}#${member.user.discriminator}` : '',
            author: {
                avatar: author ? `${members.getAvatar(author.user)}?size=80` : '',
                name: author ? `${author.user.username}#${author.user.discriminator}` : ''
            },
            reason: b.reason,
            banDate: {
                timestamp: b.banDate.getTime(),
                formated: banDate
            },
            unbanDate: {
                timestamp: b.unbanDate.getTime(),
                formated: unbanDate
            }
        }
    }))
    res.render('admin/bans', {
        page: 'bans',
        user: req.session.user,
        bans: bannedMembers
    })
})

app.get('/birthdayMessages', requireAdmin, async (req, res) => {
    const memberList = await members.getGuildMembers()
    const messageList = await agent.getBirthdayMessages()
    const birthdayMessages = await Promise.all(messageList.map(async (m) => {
        const author = memberList.find(ml => ml.user.id === m.memberId) ?? await members.getUser(m.memberId)
        const date = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }).format(m.date)
        return {
            id: m.id,
            message: m.message,
            author: {
                avatar: author ? `${members.getAvatar(author.user)}?size=80` : '',
                name: author ? `${author.user.username}#${author.user.discriminator}` : ''
            },
            date: {
                timestamp: m.date.getTime(),
                formated: date
            }
        }
    }))
    res.render('admin/birthdayMessages', {
        page: 'birthdayMessages',
        user: req.session.user,
        birthdayMessages
    })
})

app.get('/birthdayMessage/:id([0-9]+)', requireAdmin, async (req, res) => {
    try {
        const messageId = parseInt(req.params.id)
        const birthdayMessage = await agent.getBirthdayMessageById(messageId)
        res.json(birthdayMessage)
    } catch(error) {
        res.status(500).json({ error: 'An error occurred' })
    }
})

app.patch('/birthdayMessage/:id([0-9]+)', requireAdmin, async (req, res) => {
    try {
        const messageId = parseInt(req.params.id)
        const message = req.body.message
        await agent.updateBirthdayMessage(messageId, message)
        res.json({ success: true })
    } catch(error) {
        res.status(500).json({ error: 'An error occurred' })
    }
})

app.post('/birthdayMessage', requireAdmin, async (req, res) => {
    try {
        const message = req.body.message
        const user = req.session.user
        await agent.addBirthdayMessage(message, user)
        res.json({ success: true })
    } catch(error) {
        res.status(500).json({ error: 'An error occurred' })
    }
})

app.delete('/birthdayMessage/:id([0-9]+)', requireAdmin, async (req, res) => {
    try {
        const messageId = parseInt(req.params.id)
        await agent.deleteBirthdayMessage(messageId)
        res.json({ success: true })
    } catch(error) {
        res.status(500).json({ error: 'An error occurred' })
    }
})

app.get('/twitchChannels', requireAdmin, async (req, res) => {
    const memberList = await members.getGuildMembers()
    const channelList = await agent.getTwitchChannels()
    const twitchChannels = await Promise.all(channelList.map(async (c) => {
        const member = memberList.find(ml => ml.user.id === c.memberId)
        return {
            user: {
                avatar: member ? `${members.getAvatar(member.user)}?size=80` : '',
                name: member ? `${member.user.username}#${member.user.discriminator}` : ''
            },
            name: c.channelName,
            isLive: c.live
        }
    }))
    res.render('admin/twitchChannels', {
        page: 'twitchChannels',
        user: req.session.user,
        twitchChannels
    })
})

export default app