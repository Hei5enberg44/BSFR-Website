class Preview {
    /** @type {HTMLElement} */
    #messagePreview

    /** @type {HTMLElement} */
    #embedPreview

    /** @type {HTMLDivElement} */
    #messageContainer

    /** @type {HTMLDivElement} */
    #message
    
    /** @type {HTMLDivElement} */
    #embed

    /** @type {Array<EmbedField>} */
    #embedFields = []

    /** @type {HTMLElement} */
    #target

    #data = {}

    /**
     * @param {HTMLElement} target 
     */
    constructor(target) {
        this.#target = target

        this.initMessagePreview()
    }

    initMessagePreview() {
        const $messageContainer = this.createElement('div', [ 'message-2CShn3', 'cozyMessage-1DWF9U', 'groupStart-3Mlgv1', 'wrapper-30-Nkg', 'cozy-VmLDNB', 'zalgo-26OfGz' ])
        this.#messageContainer = $messageContainer
        const $messageContent = this.createElement('div', [ 'contents-2MsGLg' ])
        const $avatar = this.createElement('img', [ 'avatar-2e8lTP', 'clickable-31pE3P' ])
        $avatar.src = 'https://cdn.discordapp.com/avatars/919212477814824971/e112cff9410ba06904e8222789246e43.webp?size=80'
        const $header = this.createElement('h3', [ 'header-2jRmjb' ])
        const $senderContainer = this.createElement('span', [ 'headerText-2z4IhQ', 'hasBadges-kliaM8' ])
        const $sender = this.createElement('span', [ 'username-h_Y3Us', 'desaturateUserColors-1O-G89', 'clickable-31pE3P' ])
        $sender.textContent = 'Agent'
        const $senderTagContainer = this.createElement('span', [ 'botTagCozy-3NTBvK', 'botTag-1NoD0B', 'botTagRegular-kpctgU', 'botTag-7aX5WZ', 'rem-3kT9wc' ])
        const $senderTag = this.createElement('span', [ 'botText-1fD6Qk' ])
        $senderTag.textContent = 'BOT'
        const $timeContainer = this.createElement('span', [ 'timestamp-p1Df1m', 'timestampInline-_lS3aK' ])
        const $time = this.createElement('time')
        const $timeSeparator = this.createElement('i', [ 'separator-AebOhG' ])
        $timeSeparator.textContent = ' — '
        const date = new Intl.DateTimeFormat('Fr-fr', { dateStyle: 'short', timeStyle: 'short' }).format(new Date())
        $time.append($timeSeparator, date)
        $timeContainer.append($time)
        const $message = this.createElement('div', [ 'markup-eYLPri', 'messageContent-2t3eCI' ])
        this.#message = $message

        $senderTagContainer.append($senderTag)
        $senderContainer.append($sender, $senderTagContainer)
        $header.append($senderContainer, $timeContainer)
        $messageContent.append($avatar, $header, $message)
        $messageContainer.append($messageContent)

        this.#messagePreview = $messageContainer

        this.#target.innerHTML = ''
        this.#target.append($messageContainer)
    }

    updateEmbedPreview() {
        this.updateEmbedFields()
        if(this.#embedPreview) this.#embedPreview.remove()
        if(this.#data.embeds) {
            for(const embed of this.#data.embeds) {
                if(!embed.title && !embed.description && !embed.fields) {
                    delete this.#data.embeds
                    return
                }
                if(typeof embed?.color === 'undefined') embed.color = parseInt('3498db', 16)

                const $container = this.createElement('div', [ 'container-2sjPya' ])
                const $embedWrapper = this.createElement('article', [ 'embedWrapper-1MtIDg', 'embedFull-1HGV2S', 'embed-hKpSrO', 'markup-eYLPri' ])
                $embedWrapper.style.borderColor = `#${embed.color.toString(16).padStart(6, '0')}`
                this.#embed = $embedWrapper
                const $gridContainer = this.createElement('div', [ 'gridContainer-1cF_Ic' ])
                // const $grid = this.createElement('div', [ 'grid-1aWVsE', 'hasThumbnail-388RMe' ])
                const $grid = this.createElement('div', [ 'grid-1aWVsE' ])
                if(embed.title) {
                    const $embedTitle = this.createElement('div', [ 'embedTitle-2n1pEb', 'embedMargin-2PsaQ4' ])
                    $embedTitle.textContent = embed.title
                    $grid.append($embedTitle)
                }
                if(embed.description) {
                    const $embedDescription = this.createElement('div', [ 'embedDescription-1DrJxZ', 'embedMargin-2PsaQ4' ])
                    $embedDescription.innerHTML = this.markdownToHTML(embed.description)
                    $grid.append($embedDescription)
                }
                if(embed.fields) {
                    const $embedFields = this.createElement('div', [ 'embedFields-2yHGHT' ])
                    let inlineCount = 0
                    for(const [key, field] of embed.fields.entries()) {
                        let gridColumn = '1 / 13'
                        if(field.inline) {
                            inlineCount++
                            if(inlineCount > 3) inlineCount = 1
                            switch(inlineCount) {
                                case 1:
                                    gridColumn = (embed?.fields[key + 2]?.inline) ? '1 / 5' : '1 / 7'
                                    break
                                case 2:
                                    gridColumn = (embed?.fields[key - 1]?.inline && embed?.fields[key + 1]?.inline) ? '5 / 9' : '7 / 13'
                                    break
                                case 3:
                                    gridColumn = '9 / 13'
                                    break
                            }
                        } else {
                            inlineCount = 0
                        }
                        const $embedField = this.createElement('div', [ 'embedField-2kda1Q' ])
                        $embedField.style.gridColumn = gridColumn
                        const $embedFieldName = this.createElement('div', [ 'embedFieldName-9LYSyR' ])
                        $embedFieldName.textContent = field.name
                        const $embedFieldValue = this.createElement('div', [ 'embedFieldValue-3EHtvR' ])
                        $embedFieldValue.innerHTML = this.markdownToHTML(field.value)
                        $embedField.append($embedFieldName, $embedFieldValue)
                        $embedFields.append($embedField)
                    }
                    $grid.append($embedFields)
                }
                $gridContainer.append($grid)
                $embedWrapper.append($gridContainer)
                $container.append($embedWrapper)

                this.#embedPreview = $container

                this.#messageContainer.append($container)
            }
        }
    }

    updateEmbedFields() {
        const fields = []
        for(const field of this.#embedFields) {
            const fieldName = field.getName()
            const fieldValue = field.getValue()
            const fieldInline = field.getInline() === 'true' ? true : false

            if(fieldName !== '' || fieldValue !== '') {
                fields.push({
                    name: fieldName,
                    value: fieldValue,
                    inline: fieldInline
                })
            }
        }

        if(fields.length > 0) {
            if(!this.#data.embeds) {
                this.#data.embeds = [
                    { fields }
                ]
            } else {
                this.#data.embeds[0].fields = fields
            }
        } else {
            if(this.#data.embeds) delete this.#data.embeds[0].fields
        }
    }

    /**
     * Créer un élément HTML
     * @param {string} tagName 
     * @param {Array<string>} classList 
     * @returns {HTMLImageElement|HTMLDivElement|HTMLSpanElement}
     */
    createElement(tagName, classList = []) {
        const $elem = document.createElement(tagName)
        if(classList.length > 0) $elem.classList.add(...classList)
        return $elem
    }

    markdownToHTML(message) {
        message = message.replace(/</g, '&lt;').replace(/>/g, '&gt;')
        message = message.replace(/\*{2}([^*]+)\*{2}/g, '<strong>$1</strong>') // bold
        message = message.replace(/\*([^*]+)\*/g, '<em>$1</em>') // italic
        message = message.replace(/_{2}([^_]+)_{2}/g, '<u>$1</u>') // underline
        message = message.replace(/~{2}([^~]+)~{2}/g, '<s>$1</s>') // strikethrough
        message = message.replace(/\|{2}([^|]+)\|{2}/g, this.spoiler('$1')) // spoiler
        message = message.replace(/```([^`]+)```/g, this.codeBloc('$1')) // code bloc
        message = message.replace(/`([^`]+)`/g, this.code('$1')) // code
        message = message.replace(/(?:(?:^&gt;\s.+(?:\n|$))+)/gm, this.blockQuote) // block quote
        message = message.replace(/&lt;(@\w+)&gt;/g, this.mention('$1')) // user mention <@user>
        message = message.replace(/(@\w+)/g, this.mention('$1')) // user mention @user
        message = message.replace(/(#\w+)/g, this.mention('$1')) // channel mention #channel
        message = message.replace(/(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*))/gm, this.url('$1')) // url
        return message
    }

    mention(username) {
        return `<span class="mention wrapper-1ZcZW- interactive" role="button">${username}</span>`
    }

    blockQuote(message) {
        return `<div class="blockquoteContainer-3VtvI1"><div class="blockquoteDivider-363utW"></div><blockquote>${message.split('\n').map(m => `${m.replace('&gt; ', '')}`).join('\n')}</blockquote></div>`
    }

    code(message) {
        return `<code class="inline">${message}</code>`
    }

    codeBloc(message) {
        return `<pre><code class="scrollbarGhostHairline-2LpzZ9 scrollbar-3vVt8d hljs">${message}</code></pre>`
    }

    spoiler(message) {
        return `<span class="spoiler spoilerText-2G40u0 hidden-2lQZ5q"><span class="inlineContent-2RshAT">${message}</span></span>`
    }

    url(message) {
        return `<a class="anchor-1X4H4q anchorUnderlineOnHover-wiZFZ_" href="${message}" rel="noreferrer noopener" target="_blank" title="${message}" role="button">${message}</a>`
    }

    setMessage(message) {
        const $message = this.#message
        $message.innerHTML = this.markdownToHTML(message)

        this.#data.content = message

        $message.querySelectorAll('.spoiler').forEach(s => {
            s.addEventListener('click', function(e) {
                const className = [...s.classList].find(c => c.includes('hidden'))
                s.classList.remove(className)
            })
        })
    }

    setEmbedTitle(title) {
        if(!this.#data.embeds) {
            this.#data.embeds = [
                { title }
            ]
        } else {
            if(title !== '')
                this.#data.embeds[0].title = title
            else
                delete this.#data.embeds[0].title
        }
        this.updateEmbedPreview()
    }

    setEmbedDescription(description) {
        if(!this.#data.embeds) {
            this.#data.embeds = [
                { description }
            ]
        } else {
            if(description !== '')
                this.#data.embeds[0].description = description
            else
                delete this.#data.embeds[0].description
        }
        this.updateEmbedPreview()
    }

    setEmbedColor(color) {
        const $embedWrapper = this.#embed
        if($embedWrapper) $embedWrapper.style.borderColor = color

        color = parseInt(color.substring(1), 16)
        if(!this.#data.embeds) {
            this.#data.embeds = [
                { color }
            ]
        } else {
            this.#data.embeds[0].color = color
        }
    }

    /**
     * Ajoute un champ d'embed
     * @param {HTMLDivElement} elem 
     * @returns {EmbedField}
     */
    addEmbedField(elem) {
        const field = new EmbedField(elem)
        this.#embedFields.push(field)
        return field
    }

    /**
     * Supprime un champ d'embed
     * @param {EmbedField} field 
     */
    removeEmbedField(field) {
        if(this.#embedFields.length > 1) {
            const fieldIndex = this.#embedFields.findIndex(ef => ef.getId() === field.getId())
            this.#embedFields.splice(fieldIndex, 1)
            field.remove()
        } else {
            field.empty()
        }

        this.updateEmbedPreview()
    }

    getEmbedFields() {
        return this.#embedFields
    }

    getData() {
        return this.#data
    }
}

class EmbedField {
    /** @type {HTMLDivElement} */
    #field

    /** @type {string} */
    #fieldId

    /**
     * @param {HTMLDivElement} field 
     */
    constructor(field) {
        this.#field = field
        this.#fieldId = field.id
    }

    getId() {
        return this.#fieldId
    }

    remove() {
        this.#field.remove()
    }

    empty() {
        const $field = this.#field
        const $fieldName = $field.querySelector('.field-name')
        $fieldName.value = ''
        const $fieldValue = $field.querySelector('.field-value')
        $fieldValue.value = ''
        const $fieldInline = $field.querySelector('.field-inline')
        $fieldInline.value = ''
    }

    setName(name) {
        const $field = this.#field
        const $fieldName = $field.querySelector('.field-name')
        $fieldName.value = name
    }

    getName() {
        const $field = this.#field
        const $fieldName = $field.querySelector('.field-name')
        return $fieldName.value
    }

    setValue(value) {
        const $field = this.#field
        const $fieldValue = $field.querySelector('.field-value')
        $fieldValue.value = value
    }

    getValue() {
        const $field = this.#field
        const $fieldValue = $field.querySelector('.field-value')
        return $fieldValue.value
    }

    setInline(inline) {
        const $field = this.#field
        const $fieldInline = $field.querySelector('.field-inline')
        $fieldInline.value = inline
    }

    getInline() {
        const $field = this.#field
        const $fieldInline = $field.querySelector('.field-inline')
        return $fieldInline.value
    }
}