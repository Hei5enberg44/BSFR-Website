import NodeCache from 'node-cache'
import DiscordAPI from './discord.js'

const cache = new NodeCache({ stdTTL: 60 * 60 * 24 })

export default {
    async getGuildMembers() {
        if(!cache.has('guildMembers')) {
            const discord = new DiscordAPI()
            const guildMembers = await discord.getGuildMembers()

            const members = []
            for(const guildMember of guildMembers) {
                let member = guildMember
                member.user.name = member.nick ?? member.user.global_name
                members.push(member)
            }

            cache.set('guildMembers', members)
            return members
        } else {
            const members = cache.get('guildMembers')
            return members
        }
    },

    async getGuildMember(userId) {
        const members = await this.getGuildMembers()
        const user = members.find(m => m.user.id === userId)
        return user
    },

    async getUser(userId) {
        const member = await this.getGuildMember(userId)
        let user = member ? member.user : null
        if(user) {
            user.getAvatarURL = () => {
                return this.getAvatarURL(user)
            }
        }
        return user
    },

    getAvatarURL(user) {
        if(user.avatar) {
            return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp`
        } else {
            const index = user?.discriminator === '0' ? (user.id >> 22) % 6 : parseInt(user.discriminator)
            return `https://cdn.discordapp.com/embed/avatars/${index % 5}.png`
        }
    }
}