const WebDAV = require('webdav')
const fs = require('node:fs')
const config = require('../config.json')

module.exports = {
    /**
     * Connexion WebDAV
     * @returns {WebDAV.WebDAVClient} client WebDAV
     */
    getClient: function() {
        const client = WebDAV.createClient(config.nextcloud.url, {
            username: config.nextcloud.username,
            password: config.nextcloud.password,
            maxBodyLength: 3 * 1024 * 1024 * 1024
        })

        return client
    },

    /**
     * Upload un fichier dans le Drive
     * @param {fs.ReadStream} source fichier source
     * @param {String} destination chemin du fichier cible
     */
    uploadFile: async function(source, destination) {
        const client = module.exports.getClient()
        await client.putFileContents(destination, source)
    },

    /**
     * Créer un dossier dans le Drive
     * @param {String} folderName chemin du dossier à créer
     */
    createFolder: async function(folderName) {
        const client = module.exports.getClient()
        if(await client.exists(folderName) === false) {
            await client.createDirectory(folderName, {
                recursive: true
            })
        }
    }
}