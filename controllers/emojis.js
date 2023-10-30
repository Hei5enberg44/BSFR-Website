import NodeCache from 'node-cache'
import DiscordAPI from './discord.js'

const cache = new NodeCache({ stdTTL: 600 })

export default {
    async getGuildEmojis(session) {
        if(!cache.has('guildEmojis')) {
            const discord = new DiscordAPI(session)
            const emojis = await discord.getGuildEmojis(session.discord)

            cache.set('guildEmojis', emojis)
            return emojis
        } else {
            const emojis = cache.get('guildEmojis')
            return emojis
        }
    }
}