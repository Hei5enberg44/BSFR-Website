import express from 'express'
import agent from '../controllers/agent.js'
import members from '../controllers/members.js'
import rankedle from '../controllers/rankedle.js'
import cubestalker from '../controllers/cubestalker.js'
import { requireAdmin } from './middlewares.js'

const app = express()

app.get('/', requireAdmin, async (req, res) => {
    res.redirect('/admin/birthdays')
})

app.get('/birthdays', requireAdmin, async (req, res) => {
    const birthdays = await agent.getBirthdays()

    const membersBirthday = []
    for(const birthday of birthdays) {
        const user = await members.getUser(birthday.memberId)
        if(!user) continue
        const date = new Intl.DateTimeFormat('fr-FR').format(new Date(birthday.date))
        membersBirthday.push({
            avatar: `${user.getAvatarURL()}?size=80`,
            name: user.username,
            date: {
                timestamp: new Date(birthday.date).getTime(),
                formated: date
            }
        })
    }

    res.render('admin/birthdays', {
        page: 'birthdays',
        user: req.session.user,
        birthdays: membersBirthday
    })
})

app.get('/mutes', requireAdmin, async (req, res) => {
    const mutes = await agent.getMutes()

    const mutedMembers = []
    for(const mute of mutes) {
        const user = await members.getUser(mute.memberId)
        const author = await members.getUser(mute.mutedBy)
        const muteDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }).format(mute.muteDate)
        const unmuteDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }).format(mute.unmuteDate)
        mutedMembers.push({
            avatar: user ? `${user.getAvatarURL()}?size=80` : '',
            name: user ? user.username : '',
            author: {
                avatar: author ? `${author.getAvatarURL()}?size=80` : '',
                name: author ? author.username : ''
            },
            reason: mute.reason,
            muteDate: {
                timestamp: mute.muteDate.getTime(),
                formated: muteDate
            },
            unmuteDate: {
                timestamp: mute.unmuteDate.getTime(),
                formated: unmuteDate
            }
        })
    }

    res.render('admin/mutes', {
        page: 'mutes',
        user: req.session.user,
        mutes: mutedMembers
    })
})

app.get('/bans', requireAdmin, async (req, res) => {
    const bans = await agent.getBans()

    const bannedMembers = []
    for(const ban of bans) {
        const user = await members.getUser(ban.memberId)
        const author = await members.getUser(ban.bannedBy)
        const banDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }).format(ban.banDate)
        const unbanDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }).format(ban.unbanDate)
        bannedMembers.push({
            avatar: user ? `${user.getAvatarURL()}?size=80` : '',
            name: user ? user.username : '',
            author: {
                avatar: author ? `${author.getAvatarURL()}?size=80` : '',
                name: author ? author.username : ''
            },
            reason: ban.reason,
            banDate: {
                timestamp: ban.banDate.getTime(),
                formated: banDate
            },
            unbanDate: {
                timestamp: ban.unbanDate.getTime(),
                formated: unbanDate
            }
        })
    }

    res.render('admin/bans', {
        page: 'bans',
        user: req.session.user,
        bans: bannedMembers
    })
})

app.get('/birthdayMessages', requireAdmin, async (req, res) => {
    const messageList = await agent.getBirthdayMessages()

    const birthdayMessages = []
    for(const message of messageList) {
        const author = await members.getUser(message.memberId)
        const date = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'medium' }).format(message.date)
        birthdayMessages.push({
            id: message.id,
            message: message.message,
            author: {
                avatar: author ? `${author.getAvatarURL()}?size=80` : '',
                name: author ? author.username : ''
            },
            date: {
                timestamp: message.date.getTime(),
                formated: date
            }
        })
    }

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
    const channelList = await agent.getTwitchChannels()

    const twitchChannels = []
    for(const channel of channelList) {
        const user = await members.getUser(channel.memberId)
        twitchChannels.push({
            user: {
                avatar: user ? `${user.getAvatarURL()}?size=80` : '',
                name: user ? user.username : ''
            },
            name: channel.channelName,
            isLive: channel.live
        })
    }

    res.render('admin/twitchChannels', {
        page: 'twitchChannels',
        user: req.session.user,
        twitchChannels
    })
})

app.get('/rankedleLogs', requireAdmin, async (req, res) => {
    const ranking = await rankedle.getRanking()
    res.render('admin/rankedle/players', {
        page: 'rankedleLogs',
        user: req.session.user,
        ranking
    })
})

app.post('/rankedleLogs', requireAdmin, async (req, res) => {
    const body = req.body

    if(!body?.player || !body?.rankedle) {
        res.redirect('/admin/rankedleLogs')
    } else {
        const memberId = body.player
        const rankedleId = parseInt(body.rankedle)
    
        const user = await members.getUser(memberId)
        const score = await rankedle.getUserScore(rankedleId, memberId)
    
        res.render('admin/rankedle/player', {
            page: 'rankedleLogs',
            user: req.session.user,
            rankedleId,
            player: user?.username ?? '',
            score
        })
    }
})

app.get('/card/request/:id([0-9]+)', requireAdmin, async (req, res) => {
    const requestId = req.params.id
    const memberCard = await cubestalker.getCardById(requestId)
    if(memberCard) {
        const user = await members.getUser(memberCard.memberId)
        memberCard.user = {
            name: user ? user.username : '',
            avatar: user ? `${user.getAvatarURL()}?size=80` : ''
        }
        const card = await cubestalker.getCard(memberCard.image)
        memberCard.image = card
    }
    res.render('admin/cardRequest.ejs', {
        page: 'cardRequest',
        user: req.session.user,
        card: memberCard
    })
})

app.post('/card/request/approve', requireAdmin, async (req, res) => {
    try {
        const user = req.session.user
        const cardId = req.body.cardId
        const card = await cubestalker.approveMemberCard(cardId)
        if(card) await cubestalker.sendCardApprovalNotification(card.memberId, user.id, true)
        res.end()
    } catch(e) {
        res.header('X-Status-Message', e.message)
        res.status(400).end()
    }
})

app.post('/card/request/deny', requireAdmin, async (req, res) => {
    try {
        const user = req.session.user
        const cardId = req.body.cardId
        const card = await cubestalker.denyMemberCard(cardId)
        if(card) await cubestalker.sendCardApprovalNotification(card.memberId, user.id, true)
        res.end()
    } catch(e) {
        res.header('X-Status-Message', e.message)
        res.status(400).end()
    }
})

export default app