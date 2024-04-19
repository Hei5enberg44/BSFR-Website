import opendatasoft from './opendatasoft.js'
import { Cities } from './database.js'

export default class City {
    /**
     * Récupère les villes d'origine des membres du serveur Discord
     * @returns {Promise<Array<{memberId: string, pays: string, commune: string, coordonnees_gps: string}>>} liste des villes
     */
    static async get() {
        const cities = await Cities.findAll({
            raw: true
        })
        return cities
    }

    static async getCityList(cityName) {
        const params = {
            select: 'geoname_id, name, country, coordinates',
            where: `name LIKE \'%${cityName.replace('\'', '\\\'')}%\'`,
            include_links: 'false',
            include_app_metas: 'false',
            offset: '0',
            limit: '50'
        }
        const cities = await opendatasoft.getDatasetRecords('geonames-all-cities-with-a-population-500', params)
        return cities.results.map(r => {
            return {
                id: r.geoname_id,
                name: `${r.name} (${r.country})`
            }
        })
    }

    static async getCityById(cityId) {
        const params = {
            select: 'geoname_id, name, country, coordinates',
            where: `geoname_id = '${cityId}'`,
            include_links: 'false',
            include_app_metas: 'false',
            offset: '0',
            limit: '50'
        }
        const cities = await opendatasoft.getDatasetRecords('geonames-all-cities-with-a-population-500', params)
        return cities.results
    }
}