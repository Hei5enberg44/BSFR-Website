import express from 'express'
import * as fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import sharp from 'sharp'
import { requireLogin, requireNitro } from './middlewares.js'
import agent from '../controllers/agent.js'
import city from '../controllers/city.js'
import cubestalker from '../controllers/cubestalker.js'
import Logger from '../utils/logger.js'

const app = express()

sharp.cache(false)

app.get('/', requireLogin, async (req, res) => {
    res.redirect('/settings/birthday')
})

app.get('/birthday', requireLogin, async (req, res) => {
    const user = req.session.user
    const birthday = await agent.getMemberBirthday(user.id)
    res.render('settings/birthday.ejs', {
        page: 'settings',
        user,
        birthday
    })
})

app.post('/birthday', requireLogin, async (req, res) => {
    try {
        const user = req.session.user

        const birthdayDate = req.body.date
        if(typeof birthdayDate === 'undefined') throw new Error('Paramètre "date" introuvable.')

        const date = new Date(birthdayDate)
        const todayDate = new Date()
        todayDate.setHours(0, 0, 0, 0)

        if(date > todayDate)
            throw new Error('Votre date de naissance ne peut pas être supéreure à la date du jour.')

        await agent.updateMemberBirthday(user.id, birthdayDate)

        Logger.log('SettingsBirthday', 'SUCCESS', `L'utilisateur ${user.username} a mis à jour sa date d'anniversaire`)
        
        res.end()
    } catch(e) {
        res.header('X-Status-Message', e.message)
        res.status(400).end()
    }
})

app.get('/roles', requireLogin, async (req, res) => {
    const user = req.session.user
    const roles = await agent.getMemberRoles(user)
    res.render('settings/roles.ejs', {
        page: 'settings',
        user,
        roles
    })
})

app.post('/roles', requireLogin, async (req, res) => {
    try {
        const user = req.session.user

        const roles = req.body.roles
        if(!roles) throw new Error('Paramètre "roles" introuvable.')

        await agent.updateMemberRoles(req.session, roles)

        Logger.log('SettingsRoles', 'SUCCESS', `L'utilisateur ${user.username} a mis à jour ses rôles`)
        
        res.end()
    } catch(e) {
        res.header('X-Status-Message', e.message)
        res.status(400).end()
    }
})

app.get('/city', requireLogin, async (req, res) => {
    const user = req.session.user
    const city = await agent.getMemberCity(user.id)
    res.render('settings/city.ejs', {
        page: 'settings',
        user,
        city
    })
})

app.get('/cities', async (req, res) => {
    try {
        const cities = await city.getCityList(req.query.q)
        res.json(cities)
    } catch(e) {
        res.status(404).end()
    }
})

app.post('/city', requireLogin, async (req, res) => {
    try {
        const user = req.session.user

        const cityId = req.body.cityId
        if(typeof cityId === 'undefined') throw new Error('Paramètre "cityId" introuvable.')

        await agent.updateMemberCity(user.id, cityId)

        Logger.log('SettingsCity', 'SUCCESS', `L'utilisateur ${user.username} a mis à jour sa ville`)
        
        res.end()
    } catch(e) {
        res.header('X-Status-Message', e.message)
        res.status(400).end()
    }
})

app.get('/twitch', requireLogin, async (req, res) => {
    const user = req.session.user
    const twitch = await agent.getMemberTwitch(user.id)
    res.render('settings/twitch.ejs', {
        page: 'settings',
        user,
        twitch
    })
})

app.post('/twitch', requireLogin, async (req, res) => {
    try {
        const user = req.session.user

        const channelName = req.body.channelName
        if(typeof channelName === 'undefined') throw new Error('Paramètre "channelName" introuvable.')

        await agent.updateMemberTwitch(user.id, channelName)

        Logger.log('SettingsTwitch', 'SUCCESS', `L'utilisateur ${user.username} a mis à jour sa chaîne Twitch`)
        
        res.end()
    } catch(e) {
        res.header('X-Status-Message', e.message)
        res.status(400).end()
    }
})

app.get('/card', requireNitro, async (req, res) => {
    const user = req.session.user
    const card = await cubestalker.getMemberCard(user.id)
    res.render('settings/card.ejs', {
        page: 'settings',
        user,
        card
    })
})

app.get('/card/preview', requireNitro, async (req, res) => {
    const user = req.session.user
    const memberCard = await cubestalker.getMemberCard(user.id)
    const card = await cubestalker.getCard(memberCard && memberCard.status !== 2 ? memberCard.image : null)
    res.setHeader('Content-Type', 'image/webp')
    res.send(Buffer.from(card, 'base64'))
})

app.post('/card/upload', requireNitro, async (req, res) => {
    if(req?.files?.file) {
        const file = req.files.file
        const user = req.session.user

        try {
            const mimetype = file.mimetype
            if(!mimetype.match(/^image\/(jpeg|jpg|png|webp)$/))
                throw new Error('Le format du fichier sélectionné n\'est pas autorisé')
            
            const filePath = `./uploads/card/${user.id}`
            await file.mv(filePath)
            if(mimetype !== 'image/png') {
                const convertedFile = await sharp(filePath).png().resize(1900).toBuffer()
                await fs.writeFile(filePath, convertedFile)
            }

            const buffer = await fs.readFile(filePath)
            const card = await cubestalker.getCard(buffer)

            Logger.log('SettingsCardImage', 'INFO', `L'image de carte Cube-Stalker de ${user.username} a bien été uploadée`)
            res.send({ success: true, data: `data:image/webp;base64,${card}` })
        } catch(error) {
            res.send({ success: false, message: error.message })
        }
    } else {
        res.json({ error: 'Invalid request' })
    }
})

app.post('/card', requireNitro, async (req, res) => {
    try {
        const user = req.session.user

        const filePath = `./uploads/card/${user.id}`
        if(!existsSync(filePath))
            throw new Error('Une erreur est survenue lors de l\'upload de l\'image')

        const image = await fs.readFile(filePath)

        const cardId = await cubestalker.updateMemberCard(user.id, image, user.isAdmin ? cubestalker.APPROVED : cubestalker.PENDING)
        if(!user.isAdmin) await cubestalker.sendCardRequest(user.id, cardId)

        Logger.log('SettingsCardImage', 'INFO', `L'utilisateur ${user.username} a mis à jour l'image de sa carte Cube-Stalker`)
        
        res.end()
    } catch(e) {
        res.header('X-Status-Message', e.message)
        res.status(400).end()
    }
})

app.post('/card/remove', requireNitro, async (req, res) => {
    try {
        const user = req.session.user
        await cubestalker.removeMemberCard(user.id)
        res.end()
    } catch(e) {
        res.header('X-Status-Message', e.message)
        res.status(400).end()
    }
})

export default app