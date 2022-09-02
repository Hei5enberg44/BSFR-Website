const { Cities } = require('./database')

module.exports = {
    /**
     * Récupère les villes d'origine des membres du serveur Discord
     * @returns {Promise<Array<{code_commune_insee: String, nom_de_la_commune: String, code_postal: Number, ligne_5: String, libelle_d_acheminement: String, coordonnees_gps: String}>>} liste des villes
     */
    get: async function() {
        const cities = await Cities.findAll({
            raw: true
        })
        return cities
    }
}