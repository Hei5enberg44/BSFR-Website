import {rename} from 'node:fs/promises'
import * as path from 'node:path'
import {promisify} from 'node:util'
import cp from 'node:child_process'
const exec = promisify(cp.exec)

export async function uploadFile(filePath, uploadPath) {
    const fileName = path.basename(filePath)
    await rename(filePath, `/media/nextcloud/data/admin/files/${uploadPath}/${fileName}`)
    await exec(`sudo -u daemon bash -c \'/usr/local/bin/php /var/www/nextcloud/occ files:scan --path "admin/files/${uploadPath}"\'`)
}