import { createCanvas, loadImage, registerFont } from 'canvas'
import * as fs from 'node:fs'
import { Cards } from './database.js'
import DiscordAPI from './discord.js'
import config from '../config.json' assert { type: 'json' }
import Logger from '../utils/logger.js'

registerFont('./public/assets/fonts/Poppins-Regular.ttf', { family: 'Poppins-Regular' })
registerFont('./public/assets/fonts/Poppins-Medium.ttf', { family: 'Poppins-Medium' })
registerFont('./public/assets/fonts/Poppins-SemiBold.ttf', { family: 'Poppins-SemiBold' })

const getDiffColor = (diff) => {
    switch (diff) {
        case 'Easy':
            return '#3CB371'
        case 'Normal':
            return '#59B0F4'
        case 'Hard':
            return '#FF6347'
        case 'Expert':
            return '#BF2A42'
        case 'ExpertPlus':
            return '#8F48DB'
    }
}

const roundedImage = (ctx, x, y, width, height, radius) => {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
}

const drawImageScaled = (img, ctx) => {
    const canvas = ctx.canvas
    const hRatio = canvas.width  / img.width
    const vRatio =  canvas.height / img.height
    const ratio = Math.max(hRatio, vRatio)
    const centerShift_x = (canvas.width - img.width * ratio) / 2
    const centerShift_y = (canvas.height - img.height * ratio) / 2
    ctx.drawImage(img, 0, 0, img.width, img.height, centerShift_x,centerShift_y, img.width * ratio, img.height * ratio)
}

const fittingString = (ctx, str, maxWidth) => {
    let width = ctx.measureText(str).width
    const ellipsis = '…'
    const ellipsisWidth = ctx.measureText(ellipsis).width
    if(width <= maxWidth || width <= ellipsisWidth) {
        return str
    }
    else {
        const len = str.length
        while(width >= maxWidth - ellipsisWidth && len-- > 0) {
            str = str.substring(0, len)
            width = ctx.measureText(str).width
        }
        return str + ellipsis
    }
}

export default {
    async getCard(profileCover = null, debug = false) {
        const leaderboardChoice = 'scoresaber'
        const playerData = {
            avatar: './public/assets/images/card/bsfr.png',
            name: 'Beat Saber FR',
            country: 'FR',
            countryRank: 1,
            rank: 1,
            pp: 500,
            averageRankedAccuracy: 100,
            topPP: null
        }
        const playerLd = {
            serverRankPP: 1,
            serverRankAcc: 1,
            serverLdTotal: 1
        }
        const playerProgress = null

        // Fabrication de la carte
        const canvas = createCanvas(1900, 760)
        const ctx = canvas.getContext('2d')
        ctx.textBaseline = 'middle'

        // Fond
        if(profileCover) {
            const background = await loadImage(profileCover)
            ctx.save()
            roundedImage(ctx, 0, 0, canvas.width, canvas.height, 20)
            ctx.clip()
            drawImageScaled(background, ctx)
            ctx.restore()

            ctx.save()
            roundedImage(ctx, 0, 0, canvas.width, canvas.height, 20)
            ctx.clip()
            ctx.globalAlpha = 0.3
            ctx.fillStyle = 'black'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.restore()
        } else {
            let colorStart = '#231b60'
            let colorStop = '#d50078'
            const gradient = ctx.createLinearGradient(0, canvas.height, canvas.width, 0)
            gradient.addColorStop(0, colorStart)
            gradient.addColorStop(1, colorStop)
            ctx.beginPath()
            ctx.roundRect(0, 0, canvas.width, canvas.height, 20)
            ctx.fillStyle = gradient
            ctx.fill()
        }

        // Avatar
        ctx.save()
        const avatar = await loadImage(playerData.avatar)
        roundedImage(ctx, 50, 50, 280, 280, 20)
        ctx.clip()
        ctx.drawImage(avatar, 50, 50, 280, 280)
        ctx.restore()

        // Pseudo du joueur
        ctx.font = '76px "Poppins-SemiBold"'
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(playerData.name, 365, 78, 930)
        // Nombre de PP
        const pp = `${Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(playerData.pp)}pp`
        ctx.font = '76px "Poppins-SemiBold"'
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(pp, canvas.width - ctx.measureText(pp).width - 40, 78)

        /**
         * Classement Leaderboard
         */
        // Icon Leaderboard
        const ldIcon = await loadImage(`./public/assets/images/card/${leaderboardChoice === 'scoresaber' ? 'ss' : (leaderboardChoice === 'beatleader' ? 'bl' : '')}.png`)
        ctx.drawImage(ldIcon, 365, 135, 60, 60)

        // Nom Leaderboard
        ctx.font = '50px "Poppins-Medium"'
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(leaderboardChoice === 'scoresaber' ? 'ScoreSaber' : (leaderboardChoice === 'beatleader' ? 'BeatLeader' : ''), 435, 165)

        // Globe
        const earth = await loadImage('./public/assets/images/card/earth.png')
        ctx.drawImage(earth, 365, 205, 60, 60)

        // Classement mondial du joueur
        const globalRank = `#${playerData.rank}`
        ctx.font = '50px "Poppins-Regular"'
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(globalRank, 435, 235)

        // Drapeau Pays Joueur
        const playerCountryFlagLeft = 435 + ctx.measureText(globalRank).width + 30
        const flagPath = `./public/assets/images/card/flags/${playerData.country.toUpperCase()}.png`
        if(fs.existsSync(flagPath)) {
            const flag = await loadImage(flagPath)
            ctx.drawImage(flag, playerCountryFlagLeft, 205, 60, 60)
        }

        // Classement du joueur dans son pays
        const countryRank = `#${playerData.countryRank}`
        ctx.font = '50px "Poppins-Regular"'
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(countryRank, playerCountryFlagLeft + 70, 235)

        // Icon Précision
        const dart = await loadImage('./public/assets/images/card/dart.png')
        ctx.drawImage(dart, 365, 275, 60, 60)

        // Précision
        const acc = `${(playerData.averageRankedAccuracy).toFixed(2)}%`
        ctx.font = '50px "Poppins-Regular"'
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(acc, 435, 305)

        // Séparateur
        let separatorLeft = ctx.measureText(globalRank).width + ctx.measureText(countryRank).width + 560
        if(separatorLeft < 750) separatorLeft = 750
        ctx.lineWidth = 4
        ctx.strokeStyle = 'white'
        ctx.beginPath()
        ctx.moveTo(separatorLeft, 130)
        ctx.lineTo(separatorLeft, 340)
        ctx.stroke()

        /**
         * Classement Serveur
         */
        // Icône BSFR
        const bsfrIcon = await loadImage(`./public/assets/images/card/bsfr.png`)
        ctx.drawImage(bsfrIcon, separatorLeft + 30, 135, 60, 60)

        // BSFR
        ctx.font = '50px "Poppins-Medium"'
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText('BSFR', separatorLeft + 100, 165)

        // Classement pp serveur
        ctx.font = '45px "Poppins-Regular"'
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(`PP: ${playerLd.serverRankPP}/${playerLd.serverLdTotal}`, separatorLeft + 30, 235)

        // Classement précision serveur
        ctx.font = '45px "Poppins-Regular"'
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(`Précision: ${playerLd.serverRankAcc}/${playerLd.serverLdTotal}`, separatorLeft + 30, 305)

        /**
         * Bar de progression
         */
        const fromPp = Math.floor(playerData.pp / 1000) * 1000
        const toPp = fromPp + 1000
        const fromPpText = `${Intl.NumberFormat('en-US').format(fromPp)}pp`
        const toPpText = `${Intl.NumberFormat('en-US').format(toPp)}pp`
        const progress = Math.ceil((playerData.pp - fromPp) * 100 / 1000)
        ctx.lineWidth = 4
        ctx.strokeStyle = 'white'
        ctx.beginPath()
        ctx.moveTo(60, 370)
        ctx.lineTo(1840, 370)
        ctx.quadraticCurveTo(1850, 370, 1850, 380)
        ctx.lineTo(1850, 430)
        ctx.quadraticCurveTo(1850, 440, 1840, 440)
        ctx.lineTo(60, 440)
        ctx.quadraticCurveTo(50, 440, 50, 430)
        ctx.lineTo(50, 380)
        ctx.quadraticCurveTo(50, 370, 60, 370)
        ctx.stroke()
        const progressWidth = Math.ceil(1796 * progress / 100)
        ctx.save()
        roundedImage(ctx, 52, 372, 1796, 66, 8)
        ctx.clip()
        ctx.fillStyle = '#27AE60'
        ctx.fillRect(52, 372, progressWidth, 66)
        ctx.restore()
        if(playerProgress) {
            const ppDiff = playerProgress.ppDiff
            if(ppDiff !== 0) {
                const progress = Math.ceil(ppDiff * 100 / 1000)
                const progressDiffWidth = Math.ceil(1796 * progress / 100)
                ctx.save()
                roundedImage(ctx, 52, 372, 1796, 66, 8)
                ctx.clip()
                ctx.fillStyle = progressDiffWidth > 0 ? '#3498DB' : '#E74C3C'
                ctx.fillRect(52 + progressWidth - progressDiffWidth, 372, progressDiffWidth, 66)
                ctx.restore()
            }
        }
        ctx.font = '50px "Poppins-Regular"'
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(fromPpText, 65, 405)
        ctx.font = '50px "Poppins-Regular"'
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(toPpText, canvas.width - ctx.measureText(toPpText).width - 65, 405)

        /**
         * Top PP
         */
        ctx.font = '45px "Poppins-SemiBold"'
        ctx.fillText('T', 52, 495)
        ctx.fillText('O', 48, 540)
        ctx.fillText('P', 52, 585)
        ctx.fillText('P', 52, 650)
        ctx.fillText('P', 52, 695)

        // Image Top PP
        ctx.save()
        const songCover = await loadImage(playerData.topPP ? playerData.topPP.cover : './public/assets/images/card/cover-default.png')
        roundedImage(ctx, 100, 480, 230, 230, 10)
        ctx.clip()
        ctx.drawImage(songCover, 100, 480, 230, 230)
        ctx.restore()

        // Difficulté Top PP
        if(playerData.topPP) {
            const mapStars = (playerData.topPP.stars).toFixed(2)
            const top = 470
            const left = 190
            const radius = 5
            const width = 150
            const height = 44
            ctx.beginPath()
            ctx.moveTo(left + radius, top)
            ctx.arcTo(left + width, top, left + width, top + height, radius)
            ctx.arcTo(left + width, top + height, left, top + height, radius)
            ctx.arcTo(left, top + height, left, top, radius)
            ctx.arcTo(left, top, left + width, top, radius)
            ctx.closePath()
            ctx.fillStyle = getDiffColor(playerData.topPP.difficulty)
            ctx.fill()
            ctx.font = '40px "Poppins-Medium"'
            ctx.fillStyle = '#FFFFFF'
            const textLeft = left + (width - ctx.measureText(mapStars).width - 40) / 2
            ctx.fillText(mapStars, textLeft, top + 23)

            // Icône Étoile
            const starIcon = await loadImage(`./public/assets/images/card/star.png`)
            ctx.drawImage(starIcon, ctx.measureText(mapStars).width + textLeft + 5, top + 4, 35, 35)
        }

        // Détails Top PP
        ctx.font = '50px "Poppins-Regular"'
        ctx.fillStyle = '#FFFFFF'
        if(playerData.topPP) {
            ctx.fillText(fittingString(ctx, playerData.topPP.name, 1850), 365, 530, 1485)
            ctx.fillText(`Mapped by ${playerData.topPP.author}`, 365, 595, 1485)
            ctx.fillText(`#${playerData.topPP.rank} | ${(playerData.topPP.pp).toFixed(2)}pp | ${(playerData.topPP.acc).toFixed(2)}% | ${playerData.topPP.fc ? 'FC ✅' : 'FC ❎'}`, 365, 665, 1485)
        } else {
            ctx.fillText(`Tu n'as pas de top PP pour le moment`, 365, 595, 1485)
        }

        // Grille (pour tests)
        if(debug) {
            ctx.lineWidth = 2
            ctx.strokeStyle = 'yellow'
            ctx.beginPath()
            ctx.moveTo(0, 40)
            ctx.lineTo(canvas.width, 40)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(365, 130)
            ctx.lineTo(canvas.width, 130)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(365, 200)
            ctx.lineTo(canvas.width, 200)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(365, 270)
            ctx.lineTo(canvas.width, 270)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(0, 340)
            ctx.lineTo(canvas.width, 340)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(0, 470)
            ctx.lineTo(canvas.width, 470)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(365, 595)
            ctx.lineTo(canvas.width, 595)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(90, 470)
            ctx.lineTo(90, 720)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(0, 720)
            ctx.lineTo(canvas.width, 720)
            ctx.stroke()
            ctx.fillStyle = 'yellow'
            ctx.fillRect(340, 40, 25, 300)
            ctx.fillStyle = 'yellow'
            ctx.fillRect(340, 470, 25, 250)
            ctx.beginPath()
            ctx.moveTo(40, 0)
            ctx.lineTo(40, canvas.height)
            ctx.stroke()
            ctx.beginPath()
            ctx.moveTo(canvas.width - 40, 0)
            ctx.lineTo(canvas.width - 40, canvas.height)
            ctx.stroke()
        }

        // Enregistrement de l'image dans un fichier temporaire
        const base64Image = canvas.toDataURL().split(';base64,').pop()
        return base64Image
    },

    PENDING: 0,
    APPROVED: 1,
    DENIED: 2,

    async getMemberCard(memberId) {
        const card = await Cards.findOne({
            where: { memberId },
            raw: true
        })
        return card
    },

    async getCardById(id) {
        const card = await Cards.findOne({
            where: { id },
            raw: true
        })
        return card
    },

    async updateMemberCard(memberId, image, status) {
        const card = await Cards.findOne({
            where: { memberId }
        })

        if(card) {
            card.image = image
            card.status = status
            await card.save()
            return card.id
        } else {
            const card = await Cards.create({
                memberId,
                image,
                status
            })
            return card.id
        }
    },

    async removeMemberCard(memberId) {
        await Cards.destroy({
            where: { memberId }
        })
    },

    async approveMemberCard(cardId) {
        const card = await Cards.findOne({
            where: { id: cardId }
        })

        if(card) {
            if(card.status !== this.PENDING)
                throw new Error('Cette demande a déjà été traitée')

            card.status = this.APPROVED
            await card.save()
        }

        return card
    },

    async denyMemberCard(cardId) {
        const card = await Cards.findOne({
            where: { id: cardId }
        })

        if(card) {
            if(card.status !== this.PENDING)
                throw new Error('Cette demande a déjà été traitée')

            card.status = this.DENIED
            await card.save()
        }

        return card
    },

    async sendCardRequest(req, memberId, cardId) {
        const discord = new DiscordAPI()

        const url = `${req.protocol}://${req.hostname}/admin/card/request/${cardId}`
        const embed = {
            title: '🖼️ Image de carte Cube-Stalker',
            color: 3447003,
            description: 'Nouvelle demande d\'approbation reçue pour une image de carte Cube-Stalker',
            fields: [
                { name: 'Auteur·ice de la demande', value: `<@${memberId}>`, inline: true },
                { name: 'Lien de la demande', value: `[Ouvrir](${url})`, inline: true }
            ]
        }

        await discord.sendMessage(config.discord.channels['logs'], { embeds: [ embed ] })

        Logger.log('SettingsCardImage', 'INFO', `Nouvelle demande d\'approbation reçue pour une image de carte Cube-Stalker: ${url}`)
    },

    async sendCardApprovalNotification(memberId, authorId, approved) {
        const discord = new DiscordAPI()

        const embed = {
            title: '🖼️ Image de carte Cube-Stalker',
            color: 3447003,
            description: `Demande d\'approbation pour une image de carte Cube-Stalker ${approved ? 'acceptée' : 'refusée'}`,
            fields: [
                { name: 'Auteur·ice de la demande', value: `<@${memberId}>`, inline: true },
                { name: `Demande ${approved ? 'acceptée' : 'refusée'} par`, value: `<@${authorId}>`, inline: true }
            ]
        }

        await discord.sendMessage(config.discord.channels['logs'], { embeds: [ embed ] })
        await discord.sendDM(memberId, {
            content: `Ta demande d'image de carte Cube-Stalker a été ${approved ? 'approuvée' : 'refusée'}.`
        })
    }
}