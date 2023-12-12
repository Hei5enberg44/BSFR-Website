import { Op } from 'sequelize'
import { FranceCities, Cities } from './database.js'

export default class City {
    /**
     * Récupère les villes d'origine des membres du serveur Discord
     * @returns {Promise<Array<{code_commune_insee: String, nom_de_la_commune: String, code_postal: Number, ligne_5: String, libelle_d_acheminement: String, coordonnees_gps: String}>>} liste des villes
     */
    static async get() {
        const cities = await Cities.findAll({
            raw: true
        })
        return cities
    }

    static async getCityList(memberId, query) {
        const cities = await FranceCities.findAll({
            where: {
                [Op.or]: {
                    code_postal: {
                        [Op.like]: `%${query}%`
                    },
                    nom_de_la_commune: {
                        [Op.like]: `%${query}%`
                    }
                }
            },
            raw: true
        })

        return !cities ? {} : cities.map(c => {
            return {
                id: c.id,
                name: `${c.nom_de_la_commune} (${c.code_postal})`
            }
        })
    }
}