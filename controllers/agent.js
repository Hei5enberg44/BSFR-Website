const { Birthdays, Mutes, Bans, BannedWords, BirthdayMessages, MaliciousURL, Twitch } = require('./database')
const { Op } = require('sequelize')

module.exports = {
    /**
     * Récupère les anniversaires des membres du serveur Discord
     * @returns {Promise<Array<{id: number, memberId: string, date: string}>>} liste des anniversaires
     */
    getBirthdays: async function() {
        const birthdays = await Birthdays.findAll({
            raw: true
        })
        return birthdays
    },

    /**
     * Récupère la liste des membres mutés du serveur Discord
     * @returns {Promise<Array<{id: number, memberId: string, mutedBy: string, reason: string, muteDate: number, unmuteDate: number}>>} liste des membres mutés
     */
    getMutes: async function() {
        const mutes = await Mutes.findAll({
            raw: true
        })
        return mutes
    },

    /**
     * Récupère la liste des membres mutés du serveur Discord
     * @returns {Promise<Array<{id: number, memberId: string, bannedBy: string, reason: string, banDate: number, unbanDate: number}>>} liste des membres mutés
     */
    getBans: async function() {
        const bans = await Bans.findAll({
            where: {
                approvedBy: {
                    [Op.not]: null
                }
            },
            raw: true
        })
        return bans
    },

    /**
     * Récupère la liste des mots bannis
     * @returns {Promise<Array<{id: number, word: string, memberId: string, date: string}>>} liste des mots bannis
     */
    getBannedWords: async function() {
        const words = await BannedWords.findAll({
            raw: true
        })
        return words
    },

    /**
     * Récupère la liste des messages d'anniversaire
     * @returns {Promise<Array<{id: number, message: string, memberId: string, date: string}>>} liste des messages d'anniversaire
     */
    getBirthdayMessages: async function() {
        const messages = await BirthdayMessages.findAll({
            raw: true
        })
        return messages
    },

    /**
     * Récupère la liste des messages d'anniversaire
     * @returns {Promise<Array<{id: number, url: string, memberId: string, date: string}>>} liste des messages d'anniversaire
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