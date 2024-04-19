const API_URL = 'https://public.opendatasoft.com/api/explore/v2.1'

const wait = (s) => new Promise((res) => setTimeout(res, s * 1000))

export default class OpenDataSoft {
    /**
     * Envoi d'une requête à l'API de ScoreSaber
     * @param url url de la requête
     * @param log true|false pour logger la requête
     * @returns résultat de la requête
     */
    static async send(url) {
        let data
        let error = false
        let retries = 0

        do {
            const res = await fetch(url)
            
            if(res.ok) {
                data = await res.json()

                error = false
            } else {
                if(res.status === 400) throw Error('Erreur 400 : Requête invalide')
                if(res.status === 404) throw Error('Erreur 404 : Page introuvable')
                if(res.status === 422) throw Error('Erreur 422 : La ressource demandée est introuvable')
                if(res.status === 503) throw Error('Erreur 503 : Service non disponible')
                if(res.status === 500) {
                    if(retries < 5) await wait(3)
                    retries++
                }
                if(res.status === 429) {
                    await wait(60)
                }

                error = true
            }
        } while(error)

        return data
    }

    static async getDatasetRecords(datasetId, params) {
        const urlParams = new URLSearchParams(params).toString()
        const url = `${API_URL}/catalog/datasets/${datasetId}/records?${urlParams}`
        const results = await this.send(url)
        return results
    }
}