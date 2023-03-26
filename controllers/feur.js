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
    }
}