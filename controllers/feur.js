import members from './members.js'
import { Feur } from './database.js'
import { Sequelize, Op } from 'sequelize'

export default {
    async getAttackers(session, ranking) {
        const memberList = await members.getGuildMembers(session)

        const query = {
            group: 'attackerId',
            attributes: [
                'attackerId',
                [ Sequelize.fn('COUNT', Sequelize.col('messageId')), 'count' ]
            ],
            order: [ [ 'count', 'desc' ] ],
            raw: true
        }

        switch(ranking) {
            case 'global':
                break
            case 'month': {
                const date = this.getMonthFirstDayDate()
                query.where = {
                    responseDate: {
                        [Op.gte]: date
                    }
                }
                break
            }
            case 'week':
            default: {
                const date = this.getMondayDate()
                query.where = {
                    responseDate: {
                        [Op.gte]: date
                    }
                }
            }
        }
        
        const attackerList = await Feur.findAll(query)

        let rank = 1
        const attackers = attackerList.map(a => {
            const member = memberList.find(m => m.user.id === a.attackerId)
            a.avatar = member ? `${members.getAvatar(member.user)}?size=80` : ''
            a.name = member ? member.user.username : ''
            a.rank = rank
            rank++
            return a
        })

        return attackers
    },

    async getVictims(session, ranking) {
        const memberList = await members.getGuildMembers(session)

        const query = {
            group: 'victimId',
            attributes: [
                'victimId',
                [ Sequelize.fn('COUNT', Sequelize.col('messageId')), 'count' ]
            ],
            order: [ [ 'count', 'desc' ] ],
            raw: true
        }

        switch(ranking) {
            case 'global':
                break
            case 'month': {
                const date = this.getMonthFirstDayDate()
                query.where = {
                    responseDate: {
                        [Op.gte]: date
                    }
                }
                break
            }
            case 'week':
            default: {
                const date = this.getMondayDate()
                query.where = {
                    responseDate: {
                        [Op.gte]: date
                    }
                }
            }
        }
        
        const victimList = await Feur.findAll(query)

        let rank = 1
        const victims = victimList.map(a => {
            const member = memberList.find(m => m.user.id === a.victimId)
            a.avatar = member ? `${members.getAvatar(member.user)}?size=80` : ''
            a.name = member ? member.user.username : ''
            a.rank = rank
            rank++
            return a
        })

        return victims
    },

    /**
     * @returns {Date}
     */
    getMondayDate() {
        const d = new Date()
        d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1))
        d.setHours(0, 0, 0, 0)
        return d
    },

    /**
     * @returns {Date}
     */
    getMonthFirstDayDate() {
        const d = new Date()
        d.setDate(1)
        d.setHours(0, 0, 0, 0)
        return d
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
            mes.attackerAvatar = memberAttacker ? `${members.getAvatar(memberAttacker.user)}?size=80` : ''
            mes.victimName = memberVictim ? memberVictim.user.username : ''
            mes.victimAvatar = memberVictim ? `${members.getAvatar(memberVictim.user)}?size=80` : ''
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
            mes.attackerAvatar = memberAttacker ? `${members.getAvatar(memberAttacker.user)}?size=80` : ''
            mes.victimName = memberVictim ? memberVictim.user.username : ''
            mes.victimAvatar = memberVictim ? `${members.getAvatar(memberVictim.user)}?size=80` : ''
            return mes
        })

        return messages
    }
}