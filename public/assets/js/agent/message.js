const $message = document.querySelector('#message')
autosize($message)

// Envoi du message
const $btnSend = document.querySelector('#send')
if($btnSend) {
    $btnSend.addEventListener('click', async function(e) {
        const $channel = document.querySelector('#channel')
        const $messageReference = document.querySelector('#message_reference')

        let error = false

        if(!error) {
            const messageReference = $messageReference.value.trim()
            $btnSend.classList.add('btn-loading')
            $btnSend.setAttribute('disabled', '')

            const data = {
                content: $message.value.trim()
            }

            if(messageReference !== '') {
                data.message_reference = { message_id: messageReference }
                data.allowed_mentions = { parse: [] }
            } else {
                delete data.message_reference
                delete data.allowed_mentions
            }

            const sendRequest = await fetch('/agent/message/send', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    channelId: $channel.value,
                    payload: data
                })
            })

            if(sendRequest.ok) {
                showAlert(true, 'Message envoyé')
            } else {
                showAlert(false, 'Une erreur est survenue lors de l\'envoi du message.')
            }

            $btnSend.classList.remove('btn-loading')
            $btnSend.removeAttribute('disabled')
        }
    })
}