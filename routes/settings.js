import express from 'express'
import { requireLogin } from './middlewares.js'
import agent from '../controllers/agent.js'
import city from '../controllers/city.js'
import config from '../config.json' assert { type: 'json' }

const app = express()

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
        
        res.end()
    } catch(e) {
        res.statusMessage = e.message
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
        const roles = req.body.roles
        if(!roles) throw new Error('Paramètre "roles" introuvable.')

        await agent.updateMemberRoles(req.session, roles)
        
        res.end()
    } catch(e) {
        res.statusMessage = e.message
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
        const user = req.session.user

        const cities = await city.getCityList(user.id, req.query.q)
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
        
        res.end()
    } catch(e) {
        res.statusMessage = e.message
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
        
        res.end()
    } catch(e) {
        res.statusMessage = e.message
        res.status(400).end()
    }
})

export default app