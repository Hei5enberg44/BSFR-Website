const mimeTypes = [
    { type: 'image/png', sig: '89504E470D0A1A0A' },
    { type: 'image/gif', sig: '474946383761' },
    { type: 'image/gif', sig: '474946383961' },
    { type: 'image/webp', sig: '52494646' },
    { type: 'image/jpg', sig: 'FFD8' }
]

export default class Mime {
    static getImageMimeType(buffer) {
        const search = buffer.slice(0, 8).toString('hex')
        const mime = mimeTypes.find(mt => mt.sig.toLowerCase() === search.substring(0, mt.sig.length).toLowerCase())
        return mime ? mime.type : null
    }
}