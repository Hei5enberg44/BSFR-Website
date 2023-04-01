import fetch from 'node-fetch'
import members from './members.js'
import config from '../config.json' assert { type: 'json' }

const discordApiUrl = 'https://discord.com/api'

export default {
    async send(discord, method, endpoint, headers = null, params = null, bot = false) {
        if(!bot && Math.floor(new Date().getTime() / 1000) > discord.tokens.expiration_date + 3600) {
            discord.tokens = await this.refreshToken(discord.tokens.refresh_token)
        }

        const request = await fetch(endpoint + ((method === 'GET' && params) || ''), {
            method: method,
            headers: {
                'Authorization': `${bot ? 'Bot ' + config.discord.bot_token : 'Bearer ' + discord.tokens.access_token} `,
                ...headers ? headers : {}
            },
            ...(method === 'POST' && params) ? { body: JSON.stringify(params) } : {}
        })

        if(request.ok) {
            const response = await request.json()
            return response
        } else {
            return false
        }
    },

    async refreshToken(refreshToken) {
        const options = new URLSearchParams({
            'client_id': config.discord.client_id,
            'client_secret': config.discord.client_secret,
            'grant_type': 'refresh_token',
            'refresh_token': refreshToken
        })

        const request = await fetch(`${discordApiUrl}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: options
        })

        if(request.ok) {
            const newTokens = await request.json()
            newTokens.expiration_date = Math.floor(new Date().getTime() / 1000) + newTokens.expires_in
            return newTokens
        } else {
            return false
        }
    },

    async revokeToken(discord) {
        const options = new URLSearchParams({
            'client_id': config.discord.client_id,
            'client_secret': config.discord.client_secret,
            'access_token': discord.tokens.access_token
        })

        const revokeTokenRequest = await fetch(`${discordApiUrl}/oauth2/token/revoke`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: options
        })

        if(revokeTokenRequest.ok) {
            await revokeTokenRequest.json()
        }
    },

    async getCurrentUser(discord) {
        const user = await this.send(discord, 'GET', `${discordApiUrl}/users/@me`)
        user.isBSFR = false
        user.isAdmin = false
        user.avatarURL = members.getAvatar(user)
        const member = await this.send(discord, 'GET', `${discordApiUrl}/guilds/${config.discord.guild_id}/members/${user.id}`, null, null, true)
        if(!member) return user
        if(member) {
            user.isBSFR = true
            if(member.roles.find(r => r === config.discord.roles['Admin'] || r === config.discord.roles['Modérateur'])) {
                user.isAdmin = true
            }
        }
        return user
    },

    async submitRun(discord, data) {
        try {
            if(Math.floor(new Date().getTime() / 1000) > discord.tokens.expiration_date + 3600) {
                discord.tokens = await this.refreshToken(discord.tokens.refresh_token)
            }

            const user = await this.getCurrentUser(discord)

            let leaderboardName = 'ScoreSaber'
            if(data.leaderboard_profil.includes('beatleader')) leaderboardName = 'BeatLeader'

            const embed = {
                title: `🎬 Nouvelle run`,
                color: 3447003,
                description: data.description,
                fields: [
                    { name: 'Auteur·ice', value: `<@${user.id}>`, inline: true },
                    { name: 'Casque', value: data.headset, inline: true },
                    { name: 'Grip', value: data.grip, inline: true },
                    { name: `Profil ${leaderboardName}`, value: `[Lien](${data.leaderboard_profil})`, inline: true },
                    { name: 'Profil Twitch', value: data.twitch_url !== '' ? `[Lien](${data.twitch_url})` : 'Non renseigné', inline: true },
                    { name: '\u200b', value: '\u200b', inline: true },
                    { name: 'Leaderboard de la map', value: `[Lien](${data.map_leaderboard})`, inline: true },
                    { name: 'Beatsaver', value: `[Lien](${data.beatsaver})`, inline: true },
                    { name: '\u200b', value: '\u200b', inline: true },
                    { name: 'Vidéo', value: `[${data.url}](${data.url})` },
                    { name: 'Commentaires', value: data.comments !== '' ? '```' + data.comments + '```' : 'Pas de commentaires' }
                ],
                thumbnail: {
                    url: user.avatarURL
                }
            }

            const response = await fetch(config.discord.webhook_voterun, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    embeds: [embed]
                })
            })

            if(!response.ok) {
                throw new Error('Échec de l\'envoi de la run')
            }

            return {
                success: 'La run a bien été envoyée'
            }
        } catch(error) {
            return {
                error: error.message
            }
        }
    },

    async getGuildMembers(discord) {
        const data = await this.send(discord, 'GET', `${discordApiUrl}/guilds/${config.discord.guild_id}/members?limit=1000`, null, null, true)
        return data
    },

    async getUserById(discord, memberId) {
        const data = await this.send(discord, 'GET', `${discordApiUrl}/users/${memberId}`, null, null, true)
        return data
    },

    async getGuildPreview(discord) {
        const data = await this.send(discord, 'GET', `${discordApiUrl}/guilds/${config.discord.guild_id}/preview`, null, null, true)
        return data
    },

    async getGuildEmojis(discord) {
        const data = await this.send(discord, 'GET', `${discordApiUrl}/guilds/${config.discord.guild_id}/emojis`, null, null, true)
        const emojis = []
        for(const emoji of data) {
            const emojiUrl = `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? 'gif' : 'webp'}?size=48&quality=lossless`
            emojis.push({
                id: emoji.id,
                name: emoji.name,
                url: emojiUrl,
                available: emoji.available
            })
        }
        return emojis
    },

    async getGuildChannels(discord) {
        const data = await this.send(discord, 'GET', `${discordApiUrl}/guilds/${config.discord.guild_id}/channels`, null, null, true)
        const channels = []
        for(const channel of data) {
            if(channel.type === 0 && !channel.parent_id) {
                channels.push({
                    id: channel.id,
                    name: channel.name,
                    position: channel.position
                })
            }
            if(channel.type === 4 && !channel.parent_id) {
                if(!channels.find(c => c.id === channel.id)) {
                    channels.push({
                        id: channel.id,
                        name: channel.name,
                        position: channel.position,
                        channels: [ ...data.filter(d => d.parent_id === channel.id && d.type === 0).sort((a, b) => a.position - b.position), ...data.filter(d => d.parent_id === channel.id && d.type === 2).sort((a, b) => a.position - b.position) ]
                    })
                }
            }
        }
        channels.sort((a, b) => a.position - b.position)
        return channels
    },

    async sendMessage(discord, channelId, payload) {
        const headers = {
            'Content-Type': 'application/json'
        }

        const res = await this.send(discord, 'POST', `${discordApiUrl}/channels/${channelId}/messages`, headers, payload, true)
        return res
    },

    async getBotMessage(discord, channelId, messageId) {
        const message = await this.send(discord, 'GET', `${discordApiUrl}/channels/${channelId}/messages/${messageId}`, null, null, true)
        if(message) {
            if(message.author.id === config.discord.client_id) {
                return message
            }
        }
        return null
    }
}