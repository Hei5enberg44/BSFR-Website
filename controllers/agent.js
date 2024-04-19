import roles from './roles.js'
import city from './city.js'
import DiscordAPI from './discord.js'
import { Birthdays, Mutes, Bans, BirthdayMessages, MaliciousURL, Twitch, Roles, RolesCategories, FranceCities, Cities, Settings } from './database.js'
import { Op } from 'sequelize'

export default class Agent {
    /**
     * Récupère les anniversaires des membres du serveur Discord
     * @returns {Promise<Array<{id: number, memberId: string, date: Date}>>} liste des anniversaires
     */
    static async getBirthdays() {
        const birthdays = await Birthdays.findAll({
            order: [
                [ 'date', 'ASC' ]
            ],
            raw: true
        })
        return birthdays
    }

    /**
     * Récupère l'anniversaire d'un membre du serveur Discord
     * @param {number} memberId identifiant du membre Discord
     * @returns {Promise<string|null>} anniversaire du membre
     */
    static async getMemberBirthday(memberId) {
        const birthday = await Birthdays.findOne({
            where: { memberId },
            raw: true
        })
        return birthday ? birthday.date : null
    }

    /**
     * Mise à jour de la date d'anniversaire d'un membre Discord
     * @param {string} memberId identifiant du membre Discord
     * @param {string} date date d'anniversaire
     */
    static async updateMemberBirthday(memberId, date) {
        const birthday = await Birthdays.findOne({
            where: { memberId }
        })

        if(date !== '') {
            if(!birthday) {
                await Birthdays.create({
                    memberId,
                    date: new Date(date)
                })
            } else {
                birthday.date = new Date(date)
                await birthday.save()
            }
        } else {
            await Birthdays.destroy({
                where: { memberId }
            })
        }
    }

    /**
     * Récupère la liste des membres mutés du serveur Discord
     * @returns {Promise<Array<{id: number, memberId: string, mutedBy: string, reason: string, muteDate: Date, unmuteDate: Date}>>} liste des membres mutés
     */
    static async getMutes() {
        const mutes = await Mutes.findAll({
            order: [
                [ 'muteDate', 'DESC' ]
            ],
            raw: true
        })
        return mutes
    }

    /**
     * Récupère la liste des membres mutés du serveur Discord
     * @returns {Promise<Array<{id: number, memberId: string, bannedBy: string, reason: string, banDate: Date, unbanDate: Date}>>} liste des membres mutés
     */
    static async getBans() {
        const bans = await Bans.findAll({
            where: {
                approvedBy: {
                    [Op.not]: null
                }
            },
            order: [
                [ 'banDate', 'DESC' ]
            ],
            raw: true
        })
        return bans
    }

    /**
     * Récupère la liste des messages d'anniversaire
     * @returns {Promise<Array<{id: number, message: string, memberId: string, date: Date}>>} liste des messages d'anniversaire
     */
    static async getBirthdayMessages() {
        const messages = await BirthdayMessages.findAll({
            order: [
                [ 'date', 'DESC' ]
            ],
            raw: true
        })
        return messages
    }

    /**
     * Récupère un message d'anniversaire
     * @param {number} id identifiant du message d'anniversaire à récupérer
     * @returns {Promise<{id: number, message: string, memberId: string, date: Date}>} message d'anniversaire
     */
    static async getBirthdayMessageById(id) {
        const message = await BirthdayMessages.findOne({
            where: {
                id: id
            },
            raw: true
        })
        return message
    }

    /**
     * Ajoute un message d'anniversaire dans la base de données
     * @param {string} message message d'anniversaire à ajouté en base de données
     * @param {Object} user utilisateur Discord réalisant l'ajout du message d'anniversaire
     */
    static async addBirthdayMessage(message, user) {
        await BirthdayMessages.create({
            message: message,
            memberId: user.id,
            date: new Date()
        })
    }

    /**
     * Met à jour un message d'anniversaire dans la base de données
     * @param {number} id identifiant du message d'anniversaire à modifier
     * @param {string} message message d'anniversaire
     */
    static async updateBirthdayMessage(id, message) {
        await BirthdayMessages.update({
            message: message
        }, {
            where: {
                id: id
            }
        })
    }

    /**
     * Supprime un message d'anniversaire de la base de données
     * @param {number} id identifiant du message d'anniversaire à supprimer
     */
    static async deleteBirthdayMessage(id) {
        await BirthdayMessages.destroy({
            where: {
                id: id
            }
        })
    }

    /**
     * Récupère la liste des messages d'anniversaire
     * @returns {Promise<Array<{id: number, url: string, memberId: string, date: Date}>>} liste des messages d'anniversaire
     */
    static async getMaliciousURLs() {
        const urls = await MaliciousURL.findAll({
            raw: true
        })
        return urls
    }

    /**
     * Récupère la liste des chaînes Twitch liées à Discord
     * @returns {Promise<Array<{id: number, memberId: string, channelName: string, live: boolean, messageId: string}>>} liste des chaînes Twitch
     */
    static async getTwitchChannels() {
        const channels = await Twitch.findAll({
            raw: true
        })
        return channels
    }

    static async getMemberTwitch(memberId) {
        const twitch = await Twitch.findOne({
            where: { memberId },
            raw: true
        })
        return twitch ? twitch.channelName : null
    }

    /**
     * Mise à jour de la chaîne Twitch d'un membre Discord
     * @param {string} memberId identifiant du membre Discord
     * @param {string} channelName nom de la chaîne Twitch
     */
    static async updateMemberTwitch(memberId, channelName) {
        const twitch = await Twitch.findOne({
            where: { memberId }
        })

        if(channelName !== '') {
            if(!twitch) {
                await Twitch.create({
                    memberId,
                    channelName,
                    live: false,
                    messageId: ''
                })
            } else {
                twitch.channelName = channelName
                await twitch.save()
            }
        } else {
            await Twitch.destroy({
                where: { memberId }
            })
        }
    }

    /**
     * Récupération des rôles du membre Discord
     * @param {object} user membre Discord
     * @returns {Promise<Array<{categoryName: string, roles: Array<{id: number, name: string, multiple: boolean, categoryName: string}>}>>}
     */
    static async getMemberRoles(user) {
        const guildRoles = await roles.getGuildRoles()
        const roleList = await Roles.findAll({
            include: [
                {
                    model: RolesCategories,
                    attributes: []
                }
            ],
            attributes: [
                'id',
                'name',
                'multiple',
                [ (RolesCategories.sequelize).literal('`roles_category`.`name`'), 'categoryName' ]
            ],
            raw: true
        })

        const userRoleList = []
        for(const role of roleList) {
            const category = userRoleList.find(rl => rl.categoryName === role.categoryName)
            if(user.roles.find(ur => ur.name === role.name)) role.checked = true
            if(!category) {
                userRoleList.push({
                    categoryName: role.categoryName,
                    roles: [ role ]
                })
            } else {
                category.roles.push(role)
            }
        }

        return userRoleList
    }

    /**
     * Mise à jour des rôles d'un membre Discord
     * @param {object} user membre Discord
     * @param {Array<{name: string, active: boolean}>} roleList liste des rôles
     */
    static async updateMemberRoles(session, userRoles) {
        const user = session.user
        const guildRoles = await roles.getGuildRoles()
        const roleList = await Roles.findAll({ raw: true })
        const assignableRoles = guildRoles.filter(gr => roleList.find(rl => rl.name === gr.name))
        const currentUserRoles = user.roles.filter(ur => !assignableRoles.find(ar => ar.id === ur.id))

        const newUserRoles = assignableRoles.filter(ar => {
            return userRoles.find(r => r.name === ar.name && r.active)
        })

        const check = []
        for(const role of newUserRoles) {
            const _role = roleList.find(r => r.name === role.name)
            if(_role.multiple === 0 && check.find(c => c.multiple === _role.multiple && c.categoryId === _role.categoryId)) {
                throw new Error('Impossible de mettre à jour les rôles.')
            } else {
                check.push(_role)
            }
        }
        
        const updatedRoles = currentUserRoles.concat(newUserRoles)
        
        if(updatedRoles.length > 0) {
            const discord = new DiscordAPI(user.id)
            await discord.updateMemberRoles(user.id, updatedRoles.map(ur => ur.id))
            session.user.roles = updatedRoles
        }
    }

    static async getMemberCity(memberId) {
        const memberCity = await Cities.findOne({
            where: { memberId },
            raw: true
        })
        return memberCity ?? null
    }

    static async updateMemberCity(memberId, cityId) {
        if(cityId !== null) {
            const citySearch = await city.getCityById(cityId)
    
            if(citySearch.length === 0) throw new Error('La ville sélectionnée est introuvable.')

            const cityData = {
                country: citySearch[0].country,
                name: citySearch[0].name,
                coordinates: `${citySearch[0].coordinates.lat},${citySearch[0].coordinates.lon}`
            }

            const userCity = await Cities.findOne({
                where: { memberId }
            })

            if(!userCity) {
                await Cities.create({
                    memberId,
                    pays: cityData.country,
                    commune: cityData.name,
                    coordonnees_gps: cityData.coordinates
                })
            } else {
                userCity.pays = cityData.country
                userCity.commune = cityData.name
                userCity.coordonnees_gps = cityData.coordinates
                await userCity.save()
            }
        } else {
            await Cities.destroy({
                where: { memberId }
            })
        }
    }

    static async getSetting(name) {
        const setting = await Settings.findOne({ where: { name } })
        if(setting) return setting.data
        return null
    }

    static async updateSetting(name, data) {
        const setting = await Settings.findOne({ where: { name } })
        if(setting) {
            setting.data = data
            await setting.save()
        }
    }
}