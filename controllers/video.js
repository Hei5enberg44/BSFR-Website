import * as path from 'node:path'
import {promisify} from 'node:util'
import cp from 'node:child_process'
const exec = promisify(cp.exec)

export default {
    async merge(videoFilePath, audioFilePath, mergedFilePath) {
        await exec(`ffmpeg -i "${videoFilePath}" -i "${audioFilePath}" -vcodec libx264 -crf 16 -acodec aac -b:a 500k "${mergedFilePath}"`)
        await exec(`rm -f "${videoFilePath}" "${audioFilePath}"`)
    },

    async uploadFile(filePath, uploadPath) {
        const fileName = path.basename(filePath)
        await exec(`sudo -u daemon bash -c 'cp "${filePath}" "/media/nextcloud/data/admin/files/${uploadPath}/${fileName}"'`)
        await exec(`rm -f "${filePath}"`)
        await exec(`sudo -u daemon bash -c '/opt/php/php8.1.14/bin/php /var/www/nextcloud/occ files:scan --path "admin/files/${uploadPath}"'`)
    }
}