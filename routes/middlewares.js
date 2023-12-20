import DiscordAPI from '../controllers/discord.js'

const requireLogin = (req, res, next) => {
    req.session.redirect = req.originalUrl
    if(!req.session.token) {
        res.redirect('/discord/authorize')
    } else {
        if(!req.session.user) {
            res.redirect('/discord/logout')
        } else {
            const expires = req.session.user?.expires ?? 0
            if(expires < Date.now()) {
                const discord = new DiscordAPI(req.session)
                discord.getCurrentUser().then(user => {
                    req.session.user = user
                    next()
                })
            } else {
                next()
            }
        }
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