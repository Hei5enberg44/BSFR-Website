const { Birthdays, Mutes, Bans, BannedWords, BirthdayMessages, MaliciousURL, Twitch } = require('./database')
const { Op } = require('sequelize')

module.exports = {
    /**
     * Récupère les anniversaires des membres du serveur Discord
     * @returns {Promise<Array<{id: number, memberId: string, date: Date}>>} liste des anniversaires
     */
    getBirthdays: async function() {
        const birthdays = await Birthdays.findAll({
            order: [
                [ 'date', 'ASC' ]
            ],
            raw: true
        })
        return birthdays
    },

    /**
     * Récupère la liste des membres mutés du serveur Discord
     * @returns {Promise<Array<{id: number, memberId: string, mutedBy: string, reason: string, muteDate: Date, unmuteDate: Date}>>} liste des membres mutés
     */
    getMutes: async function() {
        const mutes = await Mutes.findAll({
            order: [
                [ 'muteDate', 'DESC' ]
            ],
            raw: true
        })
        return mutes
    },

    /**
     * Récupère la liste des membres mutés du serveur Discord
     * @returns {Promise<Array<{id: number, memberId: string, bannedBy: string, reason: string, banDate: Date, unbanDate: Date}>>} liste des membres mutés
     */
    getBans: async function() {
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
    },

    /**
     * Récupère la liste des mots bannis
     * @returns {Promise<Array<{id: number, word: string, memberId: string, date: Date}>>} liste des mots bannis
     */
    getBannedWords: async function() {
        const words = await BannedWords.findAll({
            order: [
                [ 'date', 'DESC' ]
            ],
            raw: true
        })
        return words
    },

    /**
     * Récupère la liste des messages d'anniversaire
     * @returns {Promise<Array<{id: number, message: string, memberId: string, date: Date}>>} liste des messages d'anniversaire
     */
    getBirthdayMessages: async function() {
        const messages = await BirthdayMessages.findAll({
            order: [
                [ 'date', 'DESC' ]
            ],
            raw: true
        })
        return messages
    },

    /**
     * Récupère un message d'anniversaire
     * @param {number} id identifiant du message d'anniversaire à récupérer
     * @returns {Promise<{id: number, message: string, memberId: string, date: Date}>} message d'anniversaire
     */
    getBirthdayMessageById: async function(id) {
        const message = await BirthdayMessages.findOne({
            where: {
                id: id
            },
            raw: true
        })
        return message
    },

    /**
     * Ajoute un message d'anniversaire dans la base de données
     * @param {string} message message d'anniversaire à ajouté en base de données
     * @param {Object} user utilisateur Discord réalisant l'ajout du message d'anniversaire
     */
    addBirthdayMessage: async function(message, user) {
        await BirthdayMessages.create({
            message: message,
            memberId: user.id,
            date: new Date()
        })
    },

    /**
     * Met à jour un message d'anniversaire dans la base de données
     * @param {number} id identifiant du message d'anniversaire à modifier
     * @param {string} message message d'anniversaire
     */
    updateBirthdayMessage: async function(id, message) {
        await BirthdayMessages.update({
            message: message
        }, {
            where: {
                id: id
            }
        })
    },

    /**
     * Supprime un message d'anniversaire de la base de données
     * @param {number} id identifiant du message d'anniversaire à supprimer
     */
    deleteBirthdayMessage: async function(id) {
        await BirthdayMessages.destroy({
            where: {
                id: id
            }
        })
    },

    /**
     * Récupère la liste des messages d'anniversaire
     * @returns {Promise<Array<{id: number, url: string, memberId: string, date: Date}>>} liste des messages d'anniversaire
     */
    getMaliciousURLs: async function() {
        const urls = await MaliciousURL.findAll({
            raw: true
        })
        return urls
    },

    /**
     * Récupère la liste des chaînes Twitch liées à Discord
     * @returns {Promise<Array<{id: number, memberId: string, channelName: string, live: boolean, messageId: string}>>} liste des chaînes Twitch
     */
    getTwitchChannels: async function() {
        const channels = await Twitch.findAll({
            raw: true
        })
        return channels
    }
}