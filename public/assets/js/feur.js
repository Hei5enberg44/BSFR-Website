const $modalFeur = document.querySelector('#modalFeur')
const modalFeur = new bootstrap.Modal($modalFeur)

document.querySelectorAll('.attacker-messages').forEach(function(m) {
    m.addEventListener('click', async function(e) {
        e.preventDefault()

        const memberId = this.dataset.memberId
        await showAttackerMessages(memberId)
    })
})

document.querySelectorAll('.victim-messages').forEach(function(m) {
    m.addEventListener('click', async function(e) {
        e.preventDefault()

        const memberId = this.dataset.memberId
        await showVictimMessages(memberId)
    })
})

$modalFeur.addEventListener('hide.bs.modal', function() {
    const $modalBody = $modalFeur.querySelector('.modal-body')
    $modalBody.innerHTML = ''
})

/**
 * Affiche l'historique des messages de l'attaquant sélectionné
 * @param {string} memberId identifiant de l'attaquant
 */
const showAttackerMessages = async memberId => {
    const messagesRequest = await fetch(`/feurboard/messages/attacker/${memberId}`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        }
    })

    if(messagesRequest.ok) {
        const messages = await messagesRequest.json()
        showMessages(messages)
    }
}

/**
 * Affiche l'historique des messages de la victime sélectionnée
 * @param {string} memberId identifiant de la victime
 */
const showVictimMessages = async memberId => {
    const messagesRequest = await fetch(`/feurboard/messages/victim/${memberId}`, {
        method: 'GET',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/json'
        }
    })

    if(messagesRequest.ok) {
        const messages = await messagesRequest.json()
        showMessages(messages)
    }
}

const showMessages = messages => {
    const $modalBody = $modalFeur.querySelector('.modal-body')
    const $timelineContainer = document.createElement('ul')
    $timelineContainer.classList.add('timeline')

    for(const message of messages) {
        const $timeline = createTimeline(message)
        $timelineContainer.append($timeline)
    }

    $modalBody.append($timelineContainer)

    modalFeur.show()
}

/**
 * @typedef {Object} Message
 * @property {string} attackerId
 * @property {string} attackerName
 * @property {string} attackerAvatar
 * @property {string} victimId
 * @property {string} victimName
 * @property {string} victimAvatar
 * @property {string} messageId
 * @property {string} message
 * @property {Date} messageDate
 * @property {string} responseId
 * @property {string} response
 * @property {Date} responseDate
 */

/**
 * Création d'une timeline pour ensuite l'afficher dans le DOM
 * @param {Message} message informations du le message
 * @returns {HTMLElement}
 */
const createTimeline = message => {
    const $timeline = createTimelineElement(message.victimName, message.victimAvatar, message.message, message.messageDate)
    const $timelineResponse = createTimelineElement(message.attackerName, message.attackerAvatar, message.response, message.responseDate)
    $timeline.querySelector('.card-body').append($timelineResponse)
    return $timeline
}

/**
 * Création d'un élément HTML de timeline
 * @param {string} username nom de l'utilisateur
 * @param {string} avatarURL URL de l'avatar de l'utilisateur
 * @param {string} message message de l'utilisateur
 * @param {string} date date d'envoi du message
 * @returns {HTMLElement}
 */
const createTimelineElement = (username, avatarURL, message, date) => {
    const $timelineEvent = document.createElement('li')
    $timelineEvent.classList.add('timeline-event')
    const $timelineEventIcon = document.createElement('div')
    $timelineEventIcon.classList.add('timeline-event-icon')
    const $avatar = document.createElement('div')
    $avatar.classList.add('avatar')
    $avatar.style.backgroundImage = `url(${avatarURL})`
    $timelineEventIcon.append($avatar)
    const $timelineEventCard = document.createElement('div')
    $timelineEventCard.classList.add('card', 'timeline-event-card')
    const $timelineEventCardBody = document.createElement('div')
    $timelineEventCardBody.classList.add('card-body')
    const $dateContainer = document.createElement('div')
    $dateContainer.classList.add('text-muted', 'float-end')
    $dateContainer.textContent = Intl.DateTimeFormat('FR-fr', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(date))
    const $nameContainer = document.createElement('h4')
    $nameContainer.textContent = username
    const $messageContainer = document.createElement('p')
    $messageContainer.classList.add('text-muted')
    $messageContainer.innerHTML = message.replace(/\n/g, '<br>')
    $timelineEventCardBody.append($dateContainer)
    $timelineEventCardBody.append($nameContainer)
    $timelineEventCardBody.append($messageContainer)
    $timelineEventCard.append($timelineEventCardBody)
    $timelineEvent.append($timelineEventIcon)
    $timelineEvent.append($timelineEventCard)
    return $timelineEvent
}