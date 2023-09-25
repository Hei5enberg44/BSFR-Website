import { RankdleMaps } from './database.js'

const BEATSAVER_API_URL = 'https://api.beatsaver.com/'
const MAPS_HASH_URL = BEATSAVER_API_URL + 'maps/hash/'
const MAPS_ID_URL = BEATSAVER_API_URL + 'maps/id/'
const SEARCH_MAPS_URL = BEATSAVER_API_URL + 'search/text/'

const wait = (s) => new Promise((res) => setTimeout(res, s * 1000))

export default class BeatSaver {
    /**
     * Envoi d'une requête à l'API de BeatSaver
     * @param url url de la requête
     * @returns résultat de la requête
     */
    static async send(url) {
        let data
        let error = true
        let retries = 0

        do {
            const res = await fetch(url)
            
            if(res.ok) {
                data = await res.json()

                error = false
            } else {
                if(res.status === 404) throw Error('La ressource demandée est introuvable')
                if(res.status === 422) throw Error('La ressource demandée est introuvable')
                if(res.status === 500) {
                    if(retries < 5) await wait(3)
                    retries++
                }
                if(res.status === 429) await wait(60)

                error = true
            }
        } while(error)

        return data
    }

    /**
     * Récupération des détails d'une map en fonction d'un hash
     * @param hash hash de la map
     * @returns détail de la map
     */
    static async getMapByHash(hash) {
        try {
            const map = await this.send(MAPS_HASH_URL + hash)
            return map
        } catch(error) {
            throw new Error(`Récupération des informations de la map ${hash} depuis BeatSaver impossible : ${error.message}`)
        }
    }

    /**
     * Récupération des détails d'une map en fonction d'un identifiant
     * @param id identifiant de la map
     * @returns détail de la map
     */
    static async getMapById(id) {
        try {
            const map = await this.send(MAPS_ID_URL + id)
            return map
        } catch(error) {
            throw new Error(`Récupération des informations de la map ${id} depuis BeatSaver impossible : ${error.message}`)
        }
    }

    /**
     * Récupère les dernières maps ranked puis les insert en base de données
     * @returns nombre de nouvelles maps ranked ajoutées en base de données
     */
    static async getLastRanked() {
        let newMaps = 0

        let page = 0
        let end = false

        do {
            const params = new URLSearchParams({
                ranked: 'true',
                sortOrder: 'Latest'
            }).toString()
            const data = await this.send(SEARCH_MAPS_URL + `${page}?${params}`)

            for(const map of data.docs) {
                const exists = await RankdleMaps.findOne({ where: { 'map.id': map.id } })
                if(!exists) {
                    await RankdleMaps.create({ map: map })
                    newMaps++
                } else {
                    end = true
                }
            }

            if(data.docs.length === 0) end = true

            if(!end) {
                page++
                await wait(3)
            } else {
                page = null
            }
        } while(page !== null && !end)

        return newMaps
    }
}