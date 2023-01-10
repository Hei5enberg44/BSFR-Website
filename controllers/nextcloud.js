import config from '../config.json' assert { type: 'json' }
import fetch, { FormData } from 'node-fetch'
import { JSDOM } from 'jsdom'

export default {
    async shareFile(filePath) {
        try {
            const data = new FormData()
            data.append('path', filePath)
            data.append('shareType', 3)

            const shareRequest = await fetch(`${config.nextcloud.osc.share}/shares`, {
                method: 'POST',
                body: data,
                headers: {
                    'OCS-APIRequest': 'true',
                    'Authorization': `Basic ${Buffer.from(config.nextcloud.username + ':' + config.nextcloud.password).toString('base64')}`
                }
            })

            if(shareRequest.ok) {
                const shareResult = await shareRequest.text()
                const shareResultXml = new JSDOM(shareResult)
                const url = shareResultXml.window.document.querySelector('data url')
                if(url) return url.textContent
            }
            return null
        } catch(e) {
            return null
        }
    }
}