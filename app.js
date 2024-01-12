import express from 'express'
import session from 'express-session'
import fileUpload from 'express-fileupload'
import MySQLStore from 'express-mysql-session'
import members from './controllers/members.js'
import city from './controllers/city.js'
import rankedle from './controllers/rankedle.js'
import { CronJob } from 'cron'
import discordRoutes from './routes/discord.js'
import formsRoutes from './routes/forms.js'
import mapRoutes from './routes/map.js'
import feurboardRoutes from './routes/feurboard.js'
import rankedleRoutes from './routes/rankedle.js'
import settingsRoutes from './routes/settings.js'
import adminRoutes from './routes/admin.js'
import agentRoutes from './routes/agent.js'
import { requireLogin } from './routes/middlewares.js'
import config from './config.json' assert { type: 'json' }

const app = express()
const port = 3020

app.set('view engine', 'ejs')
app.use('/static', express.static('public'))
app.use(express.json({
    type: ['application/json', 'text/plain']
}))
app.use(express.urlencoded({
    extended: true
}))

const mysqlStore = MySQLStore(session)
const sessionStore = new mysqlStore({
    connectionLimit: 20,
    host: config.databases.website.host,
    port: config.databases.website.port,
    user: config.databases.website.username,
    password: config.databases.website.password,
    database: config.databases.website.name,
    createDatabaseTable: true
})

app.use(session({
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    secret: config.cookie.secret,
    cookie: {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        sameSite: false,
        path: '/',
        secure: config.cookie.secure,
        httpOnly: false
    }
}))

app.use(fileUpload({
    limits: { fileSize: 3 * 1024 * 1024 * 1024 },
    createParentPath: true,
    preserveExtension: true,
    uploadTimeout: 18000,
    useTempFiles: true,
    tempFileDir: './uploads'
}))

app.get('/', async (req, res) => {
    req.session.redirect = '/'

    res.render('index.ejs', {
        page: 'accueil',
        user: req.session?.user ?? null,
        inviteUrl: config.discord.invitation_url
    })
})

// Easter egg 2023
app.get('/offres-internet', (req, res) => {
    res.redirect('/static/rick.webm')
})

app.get('/cities', requireLogin, async (req, res) => {
    const cities = await city.get()
    res.json(cities)
})

app.get('/guildMembers', requireLogin, async (req, res) => {
    const memberList = await members.getGuildMembers()
    res.json(memberList)
})

app.use('/discord', discordRoutes)
app.use('/forms', formsRoutes)
app.use('/interactive-map', mapRoutes)
app.use('/feurboard', feurboardRoutes)
app.use('/rankedle', rankedleRoutes)
app.use('/settings', settingsRoutes)
app.use('/admin', adminRoutes)
app.use('/agent', agentRoutes)

app.get('/google/redirect', (req, res) => {
    console.log(req)
})

app.use((req, res) => {
    res.status(404).render('errors/404')
})

app.listen(port, () => {
    new CronJob('0 0 * * *', async () => {
        await rankedle.generateRankedle()
        await rankedle.updateRankedland()
    }, null, true, 'Europe/Paris')
})