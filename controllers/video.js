import * as path from 'node:path'
import {promisify} from 'node:util'
import cp from 'node:child_process'
const exec = promisify(cp.exec)

export default {
    async merge(videoFilePath, audioFilePath, mergedFilePath) {
        await exec(`ffmpeg -i "${videoFilePath}" -i "${audioFilePath}" -af apad -shortest "${mergedFilePath}"`)
    },

    async uploadFile(filePath, uploadPath) {
        const fileName = path.basename(filePath)
        await exec(`sudo -u daemon bash -c 'cp "${filePath}" "/media/nextcloud/data/admin/files/${uploadPath}/${fileName}"'`)
        await exec(`rm -f "${filePath}"`)
        await exec(`sudo -u daemon bash -c '/usr/local/bin/php /var/www/nextcloud/occ files:scan --path "admin/files/${uploadPath}"'`)
    }
}