require('dotenv').config()
const fetch = require('node-fetch')

module.exports = {
    send: async function(discord, method, endpoint, options = null, bot = false) {
        if(!bot && Math.floor(new Date().getTime() / 1000) > discord.tokens.expiration_date + 3600) {
            discord.tokens = await module.exports.refreshToken(discord.tokens.refresh_token)
        }

        const request = await fetch(endpoint + (options || ''), {
            method: method,
            headers: {
                'Authorization': `${bot ? 'Bot ' + process.env.DISCORD_BOT_TOKEN : 'Bearer ' + discord.tokens.access_token} `
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

    refreshToken: async function(refreshToken) {
        const options = new URLSearchParams({
            'client_id': process.env.DISCORD_CLIENT_ID,
            'client_secret': process.env.DISCORD_CLIENT_SECRET,
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

    revokeToken: async function(discord) {
        const options = new URLSearchParams({
            'client_id': process.env.DISCORD_CLIENT_ID,
            'client_secret': process.env.DISCORD_CLIENT_SECRET,
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

    getCurrentUser: async function(discord) {
        const datas = await module.exports.send(discord, 'GET', 'https://discord.com/api/users/@me')
        datas.isBSFR = await module.exports.send(discord, 'GET', `https://discord.com/api/users/@me/guilds/${process.env.DISCORD_GUILD_ID}/member`) ? true : false
        return datas
    },

    submitRun: async function(discord, datas) {
        try {
            if(Math.floor(new Date().getTime() / 1000) > discord.tokens.expiration_date + 3600) {
                discord.tokens = await module.exports.refreshToken(discord.tokens.refresh_token)
            }

            const user = await module.exports.getCurrentUser(discord)

            let content = `Utilisateur : <@${user.id}>\n`
            content += `Description : ${datas.description}\n`
            content += `Casque : ${datas.headset}\n`
            content += `Grip : ${datas.grip}\n`
            content += `Profil Twitch : ${datas.twitch_url}\n`
            content += `Profil ScoreSaber : ${datas.scoresaber_profil}\n`
            content += `Leaderboard de la map : ${datas.scoresaber_leaderboard}\n`
            content += `Lien Beatsaver : ${datas.beatsaver}\n`
            content += `Lien de la vidéo : ${datas.url}\n`
            content += `Commentaires :\n${datas.comments !== '' ? '```' + datas.comments + '```' : ''}`

            await fetch(process.env.DISCORD_WEBHOOK_VOTERUN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: content
                })
            })

            return {
                success: 'La run a bien été envoyée'
            }
        } catch(error) {
            return {
                error: 'Échec de l\'envoi de la run'
            }
        }
    },

    getGuildMembers: async function(discord) {
        const datas = await module.exports.send(discord, 'GET', `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/members?limit=1000`, null, true)
        return datas
    },

    getGuildPreview: async function(discord) {
        const datas = await module.exports.send(discord, 'GET', `https://discord.com/api/guilds/${process.env.DISCORD_GUILD_ID}/preview`, null, true)
        return datas
    }
}