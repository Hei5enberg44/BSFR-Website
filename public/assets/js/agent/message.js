const preview = new Preview(document.querySelector('#message_preview'))

const $findBtn = document.querySelector('#find')
if($findBtn) {
    const $messageReference = document.querySelector('#message_reference')
    const $messageForm = document.querySelector('#message_form')

    $findBtn.addEventListener('click', async function(e) {
        $messageReference.classList.remove('is-invalid')
        $messageForm.classList.add('d-none')

        const $channel = document.querySelector('#channel')
        const channelId = $channel.value
        const messageId = $messageReference.value.trim()

        if(messageId !== '' && !isNaN(messageId)) {
            $findBtn.classList.add('btn-loading')
            $findBtn.setAttribute('disabled', '')
            $messageReference.setAttribute('disabled', '')

            const params = new URLSearchParams({
                channelId,
                messageId
            }).toString()

            const messageRequest = await fetch(`/agent/message/get?${params}`, {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })

            if(messageRequest.ok) {
                $messageForm.classList.remove('d-none')

                const message = await messageRequest.json()
                console.log(message)
                
                const $message = document.querySelector('#message')
                $message.value = message.content
                
                if(message.embeds.length > 0) {
                    const embed = message.embeds[0]
                    
                    const $embedTitle = document.querySelector('#embed_title')
                    const $embedDescription = document.querySelector('#embed_description')
                    const $embedUrl = document.querySelector('#embed_url')

                    $embedTitle.value = embed.title ?? ''
                    preview.setEmbedTitle(embed.title ?? '')
                    $embedDescription.value = embed.description ?? ''
                    preview.setEmbedDescription(embed.description ?? '')
                    $embedUrl.value = embed.url ?? ''

                    if(embed.fields) {
                        for(const f of embed.fields) {
                            const field = addEmbedField()
                            field.setName(f.name)
                            field.setValue(f.value)
                            field.setInline(f.inline)
                        }
                    }
                }

                preview.updateEmbedPreview()
            } else {
                alert('Message introuvable')
            }
        } else {
            $messageReference.classList.add('is-invalid')
        }
        $findBtn.classList.remove('btn-loading')
        $findBtn.removeAttribute('disabled')
        $messageReference.removeAttribute('disabled')
    })
}

// Contenu du message
const $messageContent = document.querySelector('#message')
if($messageContent) {
    autosize($messageContent)

    $messageContent.addEventListener('input', function(e) {
        const content = this.value
        preview.setMessage(content)
    })
}

// Titre de l'embed
const $embedTitle = document.querySelector('#embed_title')
if($embedTitle) {
    $embedTitle.addEventListener('input', function(e) {
        preview.setEmbedTitle(this.value)
    })
}

// Description de l'embed
const $embedDescription = document.querySelector('#embed_description')
if($embedDescription) {
    $embedDescription.addEventListener('input', function(e) {
        preview.setEmbedDescription(this.value)
    })
}

// Couleur de l'embed
const $embedColor = document.querySelector('#embed_color')
if($embedColor) {
    $embedColor.addEventListener('change', function(e) {
        preview.setEmbedColor(this.value)
    })
}

// Ajouer un champ
const $btnAddField = document.querySelector('#add_field')
if($btnAddField) {
    $btnAddField.addEventListener('click', function(e) {
        addEmbedField()
    })

    addEmbedField()
}

function addEmbedField() {
    const $fields = document.querySelector('#fields')

    const $fieldContainerRow = document.createElement('div')
    $fieldContainerRow.classList.add('row', 'row-sm')
    $fieldContainerRow.id = `field-${Date.now()}`
    const $fieldContainerCol = document.createElement('div')
    $fieldContainerCol.classList.add('col')
    const $fieldRow = document.createElement('div')
    $fieldRow.classList.add('row', 'row-sm', 'border-bottom')
    const $fieldNameCol = document.createElement('div')
    $fieldNameCol.classList.add('col-12', 'my-1')
    const $fieldNameContainer = document.createElement('div')
    $fieldNameContainer.classList.add('input-group')
    const $fieldNameLabel = document.createElement('span')
    $fieldNameLabel.classList.add('input-group-text')
    $fieldNameLabel.textContent = 'Nom'
    const $fieldName = document.createElement('input')
    $fieldName.classList.add('form-control', 'field-name')
    $fieldName.type = 'text'
    $fieldNameContainer.append($fieldNameLabel)
    $fieldNameContainer.append($fieldName)
    $fieldNameCol.append($fieldNameContainer)
    const $fieldValueCol = document.createElement('div')
    $fieldValueCol.classList.add('col-12', 'my-1')
    const $fieldValueContainer = document.createElement('div')
    $fieldValueContainer.classList.add('input-group')
    const $fieldValueLabel = document.createElement('span')
    $fieldValueLabel.classList.add('input-group-text')
    $fieldValueLabel.textContent = 'Valeur'
    const $fieldValue = document.createElement('input')
    $fieldValue.classList.add('form-control', 'field-value')
    $fieldValue.type = 'text'
    $fieldValueContainer.append($fieldValueLabel)
    $fieldValueContainer.append($fieldValue)
    $fieldValueCol.append($fieldValueContainer)
    const $fieldInlineCol = document.createElement('div')
    $fieldInlineCol.classList.add('col-12', 'my-1')
    const $fieldInlineContainer = document.createElement('div')
    $fieldInlineContainer.classList.add('input-group')
    const $fieldInlineLabel = document.createElement('span')
    $fieldInlineLabel.classList.add('input-group-text')
    $fieldInlineLabel.textContent = 'Inline'
    const $fieldInline = document.createElement('select')
    $fieldInline.classList.add('form-select', 'field-inline')
    const $fieldInlineOption1 = document.createElement('option')
    $fieldInlineOption1.value = ''
    $fieldInlineOption1.textContent = ''
    const $fieldInlineOption2 = document.createElement('option')
    $fieldInlineOption2.value = 'true'
    $fieldInlineOption2.textContent = 'Oui'
    const $fieldInlineOption3 = document.createElement('option')
    $fieldInlineOption3.value = 'false'
    $fieldInlineOption3.textContent = 'Non'
    $fieldInline.append($fieldInlineOption1)
    $fieldInline.append($fieldInlineOption2)
    $fieldInline.append($fieldInlineOption3)
    $fieldInlineContainer.append($fieldInlineLabel)
    $fieldInlineContainer.append($fieldInline)
    $fieldInlineCol.append($fieldInlineContainer)
    $fieldRow.append($fieldNameCol)
    $fieldRow.append($fieldValueCol)
    $fieldRow.append($fieldInlineCol)
    $fieldContainerCol.append($fieldRow)
    const $deleteFieldSvg = '<svg xmlns="http://www.w3.org/2000/svg" class="icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"></path><path d="M18 6l-12 12"></path><path d="M6 6l12 12"></path></svg>'
    const $deleteFieldCol = document.createElement('div')
    $deleteFieldCol.classList.add('col-auto')
    const $deleteFieldBtn = document.createElement('button')
    $deleteFieldBtn.classList.add('btn', 'btn-icon', 'h-100', 'delete-field')
    $deleteFieldBtn.append(document.createRange().createContextualFragment($deleteFieldSvg))
    $deleteFieldCol.append($deleteFieldBtn)
    $fieldContainerRow.append($deleteFieldCol)
    $fieldContainerRow.append($fieldContainerCol)
    $fields.append($fieldContainerRow)

    const field = preview.addEmbedField($fieldContainerRow)

    $fieldName.addEventListener('input', function(e) {
        preview.updateEmbedPreview()
    })

    $fieldValue.addEventListener('input', function(e) {
        preview.updateEmbedPreview()
    })

    $fieldInline.addEventListener('input', function(e) {
        preview.updateEmbedPreview()
    })

    $deleteFieldBtn.addEventListener('click', function(e) {
        preview.removeEmbedField(field)
    })

    return field
}

// Envoi du message
const $btnSend = document.querySelector('#send')
if($btnSend) {
    $btnSend.addEventListener('click', async function(e) {
        const $channel = document.querySelector('#channel')
        const $messageReference = document.querySelector('#message_reference')
        const $message = document.querySelector('#message')

        let error = false

        if(!error) {
            const messageReference = $messageReference.value.trim()
            $btnSend.classList.add('btn-loading')
            $btnSend.setAttribute('disabled', '')

            const data = preview.getData()
            if(messageReference !== '') data.message_reference = { message_id: messageReference }

            const sendRequest = await fetch('/agent/message/send', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    channel: $channel.value,
                    payload: data
                })
            })

            if(sendRequest.ok) {
                alert('Message envoyé')
            } else {
                alert('Une erreur est survenue lors de l\'envoi du message.\nVeuillez vérifier votre saisie.')
            }

            $btnSend.classList.remove('btn-loading')
            $btnSend.removeAttribute('disabled')
        }
    })
}