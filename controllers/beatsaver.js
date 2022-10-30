import fetch from 'node-fetch'

const beatSaverApiUrl = 'https://api.beatsaver.com/'
const mapsHashUrl = beatSaverApiUrl + '/maps/hash/'
const mapsIdUrl = beatSaverApiUrl + '/maps/id/'

const wait = (s) => new Promise((res) => setTimeout(res, s * 1000))

export default {
    /**
     * Envoi d'une requête à l'API de BeatSaver
     * @param {string} url url de la requête
     * @returns {Promise<Object>} résultat de la requête
     */
    async send(url) {
        let data
        let error = true

        do {
            const res = await fetch(url)
            if(res.ok) {
                data = await res.json()
                error = false
            } else {
                if(res.status === 404) throw Error('La ressource demandée est introuvable')
                if(res.status === 422) throw Error('La ressource demandée est introuvable')
                if(res.status === 500) await wait(3)
                if(res.status === 429) await wait(60)
                error = true
            }
        } while(error)

        return data
    },

    /**
     * Metadonnées d'une map BeatSaver
     * @typedef {Object} BeatSaverMapMetadatas
     * @property {number} duration
     * @property {string} levelAuthorName
     * @property {string} songAuthorName
     * @property {string} songName
     * @property {string} songSubName
     */

    /**
     * Map BeatSaver
     * @typedef {Object} BeatSaverMap
     * @property {string} id
     * @property {string} description
     * @property {string} name
     * @property {boolean} qualified
     * @property {boolean} ranked
     * @property {BeatSaverMapMetadatas} metadata
     */

    /**
     * Récupération des détails d'une map en fonction d'un hash
     * @param {string} hash hash de la map
     * @returns {Promise<BeatSaverMap>} détail de la map
     */
    async getMapByHash(hash) {
        try {
            const map = await this.send(mapsHashUrl + hash)

            return map
        } catch(error) {
            throw new Error(`Récupération des informations de la map depuis BeatSaver impossible : ${error.message}`)
        }
    },

    /**
     * Récupération des détails d'une map en fonction d'un identifiant
     * @param {string} id identifiant de la map
     * @returns {Promise<BeatSaverMap>} détail de la map
     */
    async getMapById(id) {
        try {
            const map = await this.send(mapsIdUrl + id)

            return map
        } catch(error) {
            throw new Error(`Récupération des informations de la map depuis BeatSaver impossible : ${error.message}`)
        }
    }
}