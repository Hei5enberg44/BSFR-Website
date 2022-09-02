const discord = require('./discord')

module.exports = {
    getGuildMembers: async function(session) {
        const date = Math.floor(Date.now() / 1000)
        if(session.discord.guildMembers) {
            if(date > session.discord.guildMembers.expires) {
                session.discord.guildMembers = null
            } else {
                return session.discord.guildMembers.data
            }
        }
        const members = await discord.getGuildMembers(session.discord)
        const expires = date + 600
        session.discord.guildMembers = {
            data: members,
            expires: expires
        }
        return members
    },

    getUser: async function(session, userId) {
        const date = Math.floor(Date.now() / 1000)
        if(session.discord.members) {
            if(date > session.discord.members.expires) {
                session.discord.members = null
            } else {
                const member = session.discord.members.data.find(m => m.user.id === userId)
                if(member) return member
            }
        }
        const user = await discord.getUserById(session.discord, userId)
        const member = { user: user }
        const expires = date + 3600
        const data = session.discord?.members?.data ? [ ...session.discord.members.data, member ] : [ member ]
        session.discord.members = {
            data: data,
            expires: expires
        }
        return member
    }
}