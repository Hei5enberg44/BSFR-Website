import members from './members.js'
import { Feur } from './database.js'
import { Sequelize } from 'sequelize'

export default {
    async getAttackers(session) {
        const memberList = await members.getGuildMembers(session)
        
        const attackerList = await Feur.findAll({
            group: 'attackerId',
            attributes: [
                'attackerId',
                [ Sequelize.fn('COUNT', Sequelize.col('messageId')), 'count' ]
            ],
            order: [ [ 'count', 'desc' ] ],
            raw: true
        })

        let rank = 1
        const attackers = attackerList.map(a => {
            const member = memberList.find(m => m.user.id === a.attackerId)
            a.avatar = member ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.webp?size=80` : ''
            a.name = member ? member.user.username : ''
            a.rank = rank
            rank++
            return a
        })

        return attackers
    },

    async getVictims(session) {
        const memberList = await members.getGuildMembers(session)
        
        const victimList = await Feur.findAll({
            group: 'victimId',
            attributes: [
                'victimId',
                [ Sequelize.fn('COUNT', Sequelize.col('messageId')), 'count' ]
            ],
            order: [ [ 'count', 'desc' ] ],
            raw: true
        })

        let rank = 1
        const victims = victimList.map(a => {
            const member = memberList.find(m => m.user.id === a.victimId)
            a.avatar = member ? `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.webp?size=80` : ''
            a.name = member ? member.user.username : ''
            a.rank = rank
            rank++
            return a
        })

        return victims
    },

    async getAttackerMessages(session, attackerId) {
        const memberList = await members.getGuildMembers(session)

        const messageList = await Feur.findAll({
            where: {
                attackerId: attackerId
            },
            order: [ [ 'responseDate', 'desc' ] ],
            raw: true
        })

        const messages = messageList.map(mes => {
            const memberAttacker = memberList.find(m => m.user.id === mes.attackerId)
            const memberVictim = memberList.find(m => m.user.id === mes.victimId)
            mes.attackerName = memberAttacker ? memberAttacker.user.username : ''
            mes.attackerAvatar = memberAttacker ? `https://cdn.discordapp.com/avatars/${memberAttacker.user.id}/${memberAttacker.user.avatar}.webp?size=80` : ''
            mes.victimName = memberVictim ? memberVictim.user.username : ''
            mes.victimAvatar = memberVictim ? `https://cdn.discordapp.com/avatars/${memberVictim.user.id}/${memberVictim.user.avatar}.webp?size=80` : ''
            return mes
        })

        return messages
    },

    async getVictimMessages(session, victimId) {
        const memberList = await members.getGuildMembers(session)

        const messageList = await Feur.findAll({
            where: {
                victimId: victimId
            },
            order: [ [ 'responseDate', 'desc' ] ],
            raw: true
        })

        const messages = messageList.map(mes => {
            const memberAttacker = memberList.find(m => m.user.id === mes.attackerId)
            const memberVictim = memberList.find(m => m.user.id === mes.victimId)
            mes.attackerName = memberAttacker ? memberAttacker.user.username : ''
            mes.attackerAvatar = memberAttacker ? `https://cdn.discordapp.com/avatars/${memberAttacker.user.id}/${memberAttacker.user.avatar}.webp?size=80` : ''
            mes.victimName = memberVictim ? memberVictim.user.username : ''
            mes.victimAvatar = memberVictim ? `https://cdn.discordapp.com/avatars/${memberVictim.user.id}/${memberVictim.user.avatar}.webp?size=80` : ''
            return mes
        })

        return messages
    }
}