import NodeCache from 'node-cache'
import DiscordAPI from './discord.js'

const cache = new NodeCache({ stdTTL: 60 * 60 * 24 })

export default {
    async getGuildMembers(session) {
        if(!cache.has('guildMembers')) {
            const discord = new DiscordAPI(session)
            const members = await discord.getGuildMembers(session.discord)

            cache.set('guildMembers', members)
            return members
        } else {
            const members = cache.get('guildMembers')
            return members
        }
    },

    async getUser(session, userId) {
        const members = await this.getGuildMembers(session)
        const user = members.find(m => m.user.id === userId)
        return user
    },

    getAvatar(user) {
        if(user.avatar) {
            return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp`
        } else {
            const discriminator = parseInt(user.discriminator)
            return `https://cdn.discordapp.com/embed/avatars/${discriminator % 5}.png`
        }
    }
}