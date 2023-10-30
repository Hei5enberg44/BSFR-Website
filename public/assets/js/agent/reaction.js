import twitter from '/static/assets/libs/emoji-mart/twitter.json' assert { type: 'json' }

/** @type {HTMLButtonElement} */
const $btnSend = document.querySelector('#send')
/** @type {HTMLButtonElement} */
const $showPickerBtn = document.querySelector('#show-picker')
/** @type {HTMLDivElement} */
const $picker = document.querySelector('#picker')

$picker.style.position = 'absolute'
$picker.style.top = `${$showPickerBtn.offsetTop + $showPickerBtn.offsetHeight + 5}px`

$showPickerBtn.addEventListener('click', () => {
    $picker.classList.toggle('d-none')
})

const guildEmojisRequest = await fetch('/agent/guildEmojis', {
    method: 'GET'
})
const guildEmojis = await guildEmojisRequest.json()

let selectedEmoji = '😀'

EmojiMart.init({ data: twitter })

const picker = new EmojiMart.Picker({
    parent: $picker,
    i18n: {
        search: 'Rechercher',
        search_no_results_1: 'Oh non!',
        search_no_results_2: 'Cet emoji ne peut être trouvé',
        pick: 'Choisissez un emoji…',
        add_custom: 'Ajouter un emoji personnalisé',
        categories: {
            activity: 'Activités',
            custom: 'Personnalisé',
            flags: 'Drapeaux',
            foods: 'Nourriture & Boissons',
            frequent: 'Fréquemment utilisé',
            nature: 'Animaux & Nature',
            objects: 'Objets',
            people: 'Smileys & Personnes',
            places: 'Voyages & Lieux',
            search: 'Résultats de recherche',
            symbols: 'Symboles'
        },
        skins: {
            choose: 'Choisissez une couleur de peau',
            1: 'Défaut',
            2: 'Clair',
            3: 'Moyen-clair',
            4: 'Moyen',
            5: 'Moyen-foncé',
            6: 'Foncé'
        }
    },
    custom: [
        {
            id: 'bsfr',
            name: 'Beat Saber FR',
            emojis: guildEmojis.map(e => {
                return {
                    id: e.name,
                    skins: [{ src: e.url }]
                }
            })
        }
    ],
    categoryIcons: {
        bsfr: {
            src: '/static/assets/images/logo2.gif'
        }
    },
    set: 'twitter',
    skinTonePosition: 'search',
    theme: 'dark',
    onEmojiSelect: (emoji, e) => {
        $showPickerBtn.innerHTML = ''
        if(emoji.native) {
            selectedEmoji = emoji.native
            const $emoji = document.createElement('em-emoji')
            $emoji.setAttribute('shortcodes', emoji.shortcodes)
            $emoji.setAttribute('set', 'twitter')
            $showPickerBtn.append($emoji)
        } else {
            const guildEmoji = guildEmojis.find(e => e.name === emoji.id)
            selectedEmoji = `${guildEmoji.name}:${guildEmoji.id}`
            const $img = document.createElement('img')
            $img.src = emoji.src
            $img.width = 24
            $showPickerBtn.append($img)
        }
        $picker.classList.add('d-none')
    },
    onClickOutside: (e) => {
        const parents = []
        let parent = e.target
        do {
            parent = parent.parentElement
            if(parent) parents.push(parent.id)
        } while(parent)
        if(e.target.id !== 'show-picker' && !parents.find(p => p === 'show-picker') && !$picker.classList.contains('d-none')) {
            $picker.classList.add('d-none')
        }
    }
})

if($btnSend) {
    $btnSend.addEventListener('click', async function(e) {
        const $channel = document.querySelector('#channel')
        const $message = document.querySelector('#message')

        const messageId = $message.value.trim()

        if(messageId === '') {
            showAlert(false, 'Veuillez indiquer l\'identifiant du message auquel vous voulez insérer une réaction.')
        } else {
            $btnSend.classList.add('btn-loading')
            $btnSend.setAttribute('disabled', '')

            const sendRequest = await fetch('/agent/reaction/send', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    channelId: $channel.value,
                    messageId,
                    emoji: selectedEmoji
                })
            })

            if(sendRequest.ok) {
                showAlert(true, 'Réaction envoyée')
            } else {
                showAlert(false, 'Une erreur est survenue lors de l\'envoi de la réaction.')
            }

            $btnSend.classList.remove('btn-loading')
            $btnSend.removeAttribute('disabled')
        }
    })
}