import jwt from 'jsonwebtoken'
import members from './members.js'
import config from '../config.json' assert { type: 'json' }

const DISCORD_API_URL = 'https://discord.com/api'

export default class DiscordAPI {
    session

    constructor(session) {
        this.session = session
    }

    async send(method, endpoint, headers = null, body = null, bot = false) {
        const token = !bot ? await this.getToken() : null

        const request = await fetch(`${DISCORD_API_URL}${endpoint}`, {
            method: method,
            headers: {
                'Authorization': `${bot ? `Bot ${config.discord.bot_token}` : `${token.token_type} ${token.access_token}`}`,
                ...headers ? headers : {}
            },
            ...(method === 'POST' && body) ? { body: JSON.stringify(body) } : {}
        })

        if(request.ok) {
            const response = await request.json()
            return response
        } else {
            console.log(request)
            return false
        }
    }

    async setToken(token) {
        this.session.token = await new Promise((res, rej) => {
            jwt.sign({
                ...token,
                expiration_date: Math.floor(Date.now() / 1000) + token.expires_in - 60
            }, config.cookie.secret, {
                algorithm: 'HS512'
            }, (err, token) => {
                if(err) rej(err)
                res(token)
            })
        })
    }

    async getToken() {
        try {
            const decodedToken = await new Promise((res, rej) => {
                jwt.verify(this.session.token, config.cookie.secret, (err, decoded) => {
                    if(err) rej(err)
                    res(decoded)
                })
            })

            if(Math.floor(new Date().getTime() / 1000) > decodedToken.expiration_date) {
                const token = await this.refreshToken(decodedToken.refresh_token)
                return token
            }

            return decodedToken
        } catch(error) {
            console.log(error)
        }
    }

    async refreshToken(refreshToken) {
        const options = new URLSearchParams({
            'client_id': config.discord.client_id,
            'client_secret': config.discord.client_secret,
            'grant_type': 'refresh_token',
            'refresh_token': refreshToken
        })

        const request = await fetch(`${DISCORD_API_URL}/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: options
        })

        if(request.ok) {
            const token = await request.json()
            await this.setToken(token)
            return token
        } else {
            throw new Error('Failed to refresh token')
        }
    }

    async revokeToken() {
        const token = await this.getToken()

        const options = new URLSearchParams({
            client_id: config.discord.client_id,
            client_secret: config.discord.client_secret,
            token: token.access_token
        })

        await fetch(`${DISCORD_API_URL}/oauth2/token/revoke`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: options
        })

        await new Promise(res => this.session.destroy(() => {
            res()
        }))
    }

    async getCurrentUser() {
        const user = await this.send('GET', '/users/@me')
        user.isBSFR = false
        user.isAdmin = false
        user.avatarURL = members.getAvatar(user)
        const member = await this.send('GET', `/guilds/${config.discord.guild_id}/members/${user.id}`, null, null, true)
        if(!member) return user
        if(member) {
            user.isBSFR = true
            if(member.roles.find(r => r === config.discord.roles['Admin'] || r === config.discord.roles['Modérateur'])) {
                user.isAdmin = true
            }
        }
        return user
    }

    async submitRun(data) {
        try {
            const user = await this.getCurrentUser()

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
                    { name: 'Vidéo', value: data.url },
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
                console.log(response)
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
    }

    async getGuildMembers() {
        const limit = 1000
        let after = null
        let members = []
        do {
            const data = await this.send('GET', `/guilds/${config.discord.guild_id}/members?limit=${limit}${after ? `&after=${after}` : ''}`, null, null, true)
            after = data.length === limit ? data.length > 0 ? ([...data].pop()).user.id : null : null
            members = [ ...members, ...data ]
        } while(after !== null)
        return members
    }

    async getUserById(memberId) {
        const data = await this.send('GET', `/users/${memberId}`, null, null, true)
        return data
    }

    async getGuildPreview() {
        const data = await this.send('GET', `/guilds/${config.discord.guild_id}/preview`, null, null, true)
        return data
    }

    async getGuildEmojis() {
        const data = await this.send('GET', `/guilds/${config.discord.guild_id}/emojis`, null, null, true)
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
    }

    async getGuildChannels() {
        const data = await this.send('GET', `/guilds/${config.discord.guild_id}/channels`, null, null, true)
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
    }

    async sendMessage(channelId, payload) {
        const headers = {
            'Content-Type': 'application/json'
        }

        const res = await this.send('POST', `/channels/${channelId}/messages`, headers, payload, true)
        return res
    }

    async getBotMessage(channelId, messageId) {
        const message = await this.send('GET', `/channels/${channelId}/messages/${messageId}`, null, null, true)
        if(message) {
            if(message.author.id === config.discord.client_id) {
                return message
            }
        }
        return null
    }
}