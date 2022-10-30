import { YoutubeVideos } from './database.js'

export default {
    /**
     * Récupère la dernière vidéo YouTube publiée sur la chaîne
     * @returns {Promise<{id: number, videoId: string, publishedAt: Date, title: string}>}
     */
    async getLastVideo() {
        const video = await YoutubeVideos.findOne({
            order: [
                [ 'publishedAt', 'desc' ]
            ]
        })

        return video
    }
}