const discord = require('./discord')

module.exports = {
    get: async function(session) {
        const date = Math.floor(Date.now() / 1000)
        if(session.discord.members) {
            if(date > session.discord.members.expires) {
                session.discord.members = null
            } else {
                return session.discord.members.data
            }
        }
        const members = await discord.getGuildMembers(session.discord)
        const expires = date + 600
        session.discord.members = {
            data: members,
            expires: expires
        }
        return members
    }
}