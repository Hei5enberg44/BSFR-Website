import fetch from 'node-fetch'
import config from '../config.json' assert { type: 'json' }

export default {
    async send(discord, method, endpoint, options = null, bot = false) {
        if(!bot && Math.floor(new Date().getTime() / 1000) > discord.tokens.expiration_date + 3600) {
            discord.tokens = await this.refreshToken(discord.tokens.refresh_token)
        }

        const request = await fetch(endpoint + (options || ''), {
            method: method,
            headers: {
                'Authorization': `${bot ? 'Bot ' + config.discord.bot_token : 'Bearer ' + discord.tokens.access_token} `
            },
            body: options
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

        const request = await fetch('https://discord.com/api/oauth2/token', {
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

        const revokeTokenRequest = await fetch('https://discord.com/api/oauth2/token/revoke', {
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
        const user = await this.send(discord, 'GET', 'https://discord.com/api/users/@me')
        user.isBSFR = false
        user.isAdmin = false
        const member = await this.send(discord, 'GET', `https://discord.com/api/guilds/${config.discord.guild_id}/members/${user.id}`, null, true)
        if(!member) return user
        if(member) {
            user.isBSFR = true
            if(member.roles.find(r => r === config.discord.roles['Admin'] || r === config.discord.roles['Modérateur'])) {
                user.isAdmin = true
            }
        }
        return user
    },

    async submitRun(discord, datas) {
        try {
            if(Math.floor(new Date().getTime() / 1000) > discord.tokens.expiration_date + 3600) {
                discord.tokens = await this.refreshToken(discord.tokens.refresh_token)
            }

            const user = await this.getCurrentUser(discord)

            let leaderboardName = 'ScoreSaber'
            if(datas.leaderboard_profil.includes('beatleader')) leaderboardName = 'BeatLeader'

            const embed = {
                title: `🎬 Nouvelle run`,
                color: 3447003,
                description: datas.description,
                fields: [
                    { name: 'Auteur·ice', value: `<@${user.id}>`, inline: true },
                    { name: 'Casque', value: datas.headset, inline: true },
                    { name: 'Grip', value: datas.grip, inline: true },
                    { name: `Profil ${leaderboardName}`, value: `[Lien](${datas.leaderboard_profil})`, inline: true },
                    { name: 'Profil Twitch', value: datas.twitch_url !== '' ? `[Lien](${datas.twitch_url})` : 'Non renseigné', inline: true },
                    { name: '\u200b', value: '\u200b', inline: true },
                    { name: 'Leaderboard de la map', value: `[Lien](${datas.map_leaderboard})`, inline: true },
                    { name: 'Beatsaver', value: `[Lien](${datas.beatsaver})`, inline: true },
                    { name: '\u200b', value: '\u200b', inline: true },
                    { name: 'Vidéo', value: `[${datas.url}](${datas.url})` },
                    { name: 'Commentaires', value: datas.comments !== '' ? '```' + datas.comments + '```' : 'Pas de commentaires' }
                ],
                thumbnail: {
                    url: `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.webp`
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
        const datas = await this.send(discord, 'GET', `https://discord.com/api/guilds/${config.discord.guild_id}/members?limit=1000`, null, true)
        return datas
    },

    async getUserById(discord, memberId) {
        const datas = await this.send(discord, 'GET', `https://discord.com/api/users/${memberId}`, null, true)
        return datas
    },

    async getGuildPreview(discord) {
        const datas = await this.send(discord, 'GET', `https://discord.com/api/guilds/${config.discord.guild_id}/preview`, null, true)
        return datas
    }
}