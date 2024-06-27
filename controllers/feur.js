import members from './members.js'
import { Feur } from './database.js'
import { Sequelize } from 'sequelize'

export default {
    async getAttackers() {
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
        const attackers = []
        for(const attacker of attackerList) {
            const user = await members.getUser(attacker.attackerId)
            if(!user) continue
            attacker.avatar = `${user.getAvatarURL()}?size=80`
            attacker.name = user.name
            attacker.rank = rank
            attackers.push(attacker)
            rank++
        }

        return attackers
    },

    async getVictims() {
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
        const victims = []
        for(const victim of victimList) {
            const user = await members.getUser(victim.victimId)
            if(!user) continue
            victim.avatar = `${user.getAvatarURL()}?size=80`
            victim.name = user.name
            victim.rank = rank
            victims.push(victim)
            rank++
        }

        return victims
    },

    async getAttackerMessages(attackerId) {
        const messageList = await Feur.findAll({
            where: {
                attackerId: attackerId
            },
            order: [ [ 'responseDate', 'desc' ] ],
            raw: true
        })

        const messages = []
        for(const message of messageList) {
            const victim = await members.getUser(message.victimId)
            const attacker = await members.getUser(message.attackerId)
            message.attackerName = attacker ? attacker.name : ''
            message.attackerAvatar = attacker ? `${attacker.getAvatarURL()}?size=80` : ''
            message.victimName = victim ? victim.name : '?'
            message.victimAvatar = victim ? `${victim.getAvatarURL()}?size=80` : ''
            messages.push(message)
        }

        return messages
    },

    async getVictimMessages(victimId) {
        const messageList = await Feur.findAll({
            where: {
                victimId: victimId
            },
            order: [ [ 'responseDate', 'desc' ] ],
            raw: true
        })

        const messages = []
        for(const message of messageList) {
            const attacker = await members.getUser(message.attackerId)
            const victim = await members.getUser(message.victimId)
            message.attackerName = attacker ? attacker.name : '?'
            message.attackerAvatar = attacker ? `${attacker.getAvatarURL()}?size=80` : ''
            message.victimName = victim ? victim.name : ''
            message.victimAvatar = victim ? `${victim.getAvatarURL()}?size=80` : ''
            messages.push(message)
        }

        return messages
    }
}