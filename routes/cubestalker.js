import express from 'express'
import cardgenerator from '../controllers/cardgenerator.js'

const app = express()

app.get('/test', async (req, res) => {
    const card = await cardgenerator.getCard()
    res.setHeader('Content-Type', 'image/png')
    res.send(Buffer.from(card, 'base64'))
})

export default app