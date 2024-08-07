import * as path from 'node:path'
import {promisify} from 'node:util'
import cp from 'node:child_process'
const exec = promisify(cp.exec)

const PHP_VERSION = '8.3.8'

export default {
    async merge(videoFilePath, audioFilePath, mergedFilePath) {
        await exec(`ffmpeg -i "${videoFilePath}" -i "${audioFilePath}" -vcodec libx264 -pix_fmt yuv420p -crf 16 -acodec aac -b:a 500k -threads 2 "${mergedFilePath}"`)
        await exec(`rm -f "${videoFilePath}" "${audioFilePath}"`)
    },

    async uploadFile(filePath, uploadPath) {
        const fileName = path.basename(filePath)
        await exec(`sudo -u www-data bash -c 'cp "${filePath}" "/media/nextcloud/data/admin/files/${uploadPath}/${fileName}"'`)
        await exec(`rm -f "${filePath}"`)
        await exec(`sudo -u www-data bash -c '/opt/php/php${PHP_VERSION}/bin/php /var/www/nextcloud/occ files:scan --path "admin/files/${uploadPath}"'`)
    }
}