const requireLogin = (req, res, next) => {
    req.session.redirect = req.originalUrl
    if(!req.session.token) {
        res.redirect('/discord/authorize')
    } else {
        if(!req.session.user) {
            res.redirect('/discord/logout')
        } else {
            next()
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

export {
    requireLogin,
    requireAdmin
}