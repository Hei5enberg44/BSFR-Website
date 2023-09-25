import NodeCache from 'node-cache'
import DiscordAPI from './discord.js'

const cache = new NodeCache({ stdTTL: 600 })

export default {
    async getGuildChannels(session) {
        if(!cache.has('guildChannels')) {
            const discord = new DiscordAPI(session)
            const channels = await discord.getGuildChannels(session.discord)

            cache.set('guildChannels', channels)
            return channels
        } else {
            const channels = cache.get('guildChannels')
            return channels
        }
    }
}