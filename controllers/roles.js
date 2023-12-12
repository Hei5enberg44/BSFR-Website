import NodeCache from 'node-cache'
import DiscordAPI from './discord.js'

const cache = new NodeCache({ stdTTL: 600 })

export default class Roles {
    static async getGuildRoles() {
        if(!cache.has('guildRoles')) {
            const discord = new DiscordAPI()
            const roles = await discord.getGuildRoles()

            cache.set('guildRoles', roles)
            return roles
        } else {
            const roles = cache.get('guildRoles')
            return roles
        }
    }
}