import DiscordAPI from '../controllers/discord.js'

const requireLogin = (req, res, next) => {
    const headers = req.headers
    const userAgent = headers['user-agent']
    if(userAgent.match(/^Mozilla\/[0-9]\.[0-9] \(\w+; Discordbot\/[0-9]\.[0-9]; \+https:\/\/discordapp\.com\)$/i)) {
        res.render('embed')
        return
    }
    
    const user = req.session.user
    req.session.redirect = req.originalUrl
    if(!user?.id) {
        res.redirect('/discord/authorize')
    } else {
        const discord = new DiscordAPI(user.id)
        discord.validateToken().then(valid => {
            if(valid)
                next()
            else
                res.redirect('/discord/authorize')
        })
    }
}

const requireAdmin = (req, res, next) => {
    requireLogin(req, res, () => {
        const user = req.session.user
        if(user.isAdmin) {
            next()
        } else {
            res.status(403).render('errors/403')
        }
    })
}

const requireNitro = (req, res, next) => {
    requireLogin(req, res, () => {
        const user = req.session.user
        if(user.isNitroBooster || user.isAdmin) {
            next()
        } else {
            res.status(403).render('errors/403')
        }
    })
}

export {
    requireLogin,
    requireAdmin,
    requireNitro
}