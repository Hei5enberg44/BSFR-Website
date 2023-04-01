import discord from './discord.js'

export default {
    async getGuildChannels(session) {
        const date = Math.floor(Date.now() / 1000)
        if(session.discord.guildChannels) {
            if(date > session.discord.guildChannels.expires) {
                session.discord.guildChannels = null
            } else {
                return session.discord.guildChannels.data
            }
        }
        const channels = await discord.getGuildChannels(session.discord)
        const expires = date + 600
        session.discord.guildChannels = {
            data: channels,
            expires: expires
        }
        return channels
    }
}