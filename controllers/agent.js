const { Birthdays, Mutes, Bans, BannedWords, BirthdayMessages, MaliciousURL } = require('./database')

module.exports = {
    /**
     * Récupère les anniversaires des membres du serveur Discord
     * @returns {Promise<Array<{memberId: string, date: string}>>} liste des anniversaires
     */
    getBirthdays: async function() {
        const birthdays = await Birthdays.findAll({
            raw: true
        })
        return birthdays
    },

    /**
     * Récupère la liste des membres mutés du serveur Discord
     * @returns {Promise<Array<{memberId: string, mutedBy: string, reason: string, unmuteDate: number}>>} liste des membres mutés
     */
    getMutes: async function() {
        const mutes = await Mutes.findAll({
            raw: true
        })
        return mutes
    },

    /**
     * Récupère la liste des membres mutés du serveur Discord
     * @returns {Promise<Array<{memberId: string, bannedBy: string, reason: string, unbanDate: number}>>} liste des membres mutés
     */
    getBans: async function() {
        const bans = await Bans.findAll({
            raw: true
        })
        return bans
    }
}