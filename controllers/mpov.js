const beatsaver = require('./beatsaver')
const { MPOV } = require('./database')

module.exports = {
    getMPOVInfos: async function() {
        try {
            const mpov = await MPOV.findAll({
                limit: 1,
                order: [
                    [ 'id', 'DESC' ]
                ]
            })

            if(!mpov) throw Error('Aucun Multi POV présent en base de données')

            try {
                const map = await beatsaver.geMapById(mpov[0].map_id)
                const mpovInfos = {
                    id: mpov[0].id,
                    dateStart: mpov[0].date_start,
                    dateEnd: mpov[0].date_end,
                    map: {
                        id: map.id,
                        songName: `${map.metadata.songAuthorName} - ${map.metadata.songName}${map.metadata.songSubName !== '' ? ` ${map.metadata.songSubName}` : ''}`,
                        levelAuthorName: map.metadata.levelAuthorName,
                        difficulty: mpov[0].difficulty,
                        cover: map.versions[0].coverURL
                    }
                }
                return mpovInfos
            } catch(err) {
                throw Error(`Une erreur est survenue lors de la récupération des informations sur la map`)
            }
        } catch(err) {
            return { error: err.message }
        }
    }
}