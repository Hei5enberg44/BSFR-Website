const SKIPS = [ 1, 2, 3, 4, 5, 14, 0 ]
const playIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" /></svg>'
const stopIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 4h-10a3 3 0 0 0 -3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3 -3v-10a3 3 0 0 0 -3 -3z" /></svg>'
const skipIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon me-2" width="64" height="64" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /></svg>'
const failIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon me-2" width="64" height="64" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>'

/** @type {HTMLAudioElement} */
const $playBtn = document.querySelector('#play-btn')
/** @type {HTMLDivElement} */
const $seekBar = document.querySelector('#seek-bar')
/** @type {HTMLDivElement} */
const $seekBarPlaceholder = document.querySelector('#seek-bar-placeholder')
/** @type {HTMLDivElement} */
const $currentTime = document.querySelector('#current-time')
/** @type {HTMLSpanElement} */
const $skipSeconds = document.querySelector('#skip-seconds')
/** @type {HTMLButtonElement} */
const $btnSkip = document.querySelector('#skip')
/** @type {HTMLButtonElement} */
const $btnSubmit = document.querySelector('#submit')
/** @type {HTMLButtonElement} */
const $btnEnd = document.querySelector('#end')
/** @type {HTMLDivElement} */
const $progress = document.querySelector('#progress')
/** @type {HTMLDivElement} */
const $seekCursor = document.querySelector('#seek-cursor')

const SONG_URL = '/rankedle/song'

const audio = new Audio(SONG_URL)

$playBtn.addEventListener('click', (e) => {
    const isPlaying = audio.currentTime > 0 && !audio.paused && !audio.ended && audio.readyState > audio.HAVE_CURRENT_DATA
    if(!isPlaying)
        playAudio()
    else
        stopAudio()
})

const playAudio = () => {
    audio.src = `${SONG_URL}?nocache=${Date.now()}`
    audio.load()
    audio.volume = window.localStorage.getItem('rankedleVolume') ? parseInt(window.localStorage.getItem('rankedleVolume')) / 100 : 0.5
    audio.play()
    $playBtn.innerHTML = stopIcon
}

const stopAudio = () => {
    audio.pause()
    audio.currentTime = 0
    $playBtn.innerHTML = playIcon
}

const resumeAudio = () => {
    const isPlaying = audio.duration > 0 && !audio.paused
    const currentTime = audio.currentTime
    audio.src = `${SONG_URL}?nocache=${Date.now()}`
    audio.load()
    audio.currentTime = currentTime
    if(isPlaying) audio.play()
}

audio.addEventListener('ended', () => {
    $playBtn.innerHTML = playIcon
})

audio.addEventListener('timeupdate', () => {
    const elapsed = Math.floor(audio.currentTime)
    $seekBar.style.width = `${audio.currentTime * 100 / 30}%`
    $currentTime.textContent = `00:${elapsed < 10 ? `0${elapsed}` : elapsed}`
})

const getElementOffset = (el) => {
    let top = 0
    let left = 0
    let element = el

    do {
        top += element.offsetTop || 0
        left += element.offsetLeft || 0
        element = element.offsetParent
    } while(element)

    return {
        top,
        left,
    }
}

if($btnSkip) {
    const toggleButtons = (enabled) => {
        if(!enabled) {
            $btnSkip.classList.add('btn-loading')
            $btnSubmit.classList.add('btn-loading')
            $btnEnd.classList.add('btn-loading')
        } else {
            $btnSkip.classList.remove('btn-loading')
            $btnSubmit.classList.remove('btn-loading')
            $btnEnd.classList.remove('btn-loading')
        }
    }

    $btnSkip.addEventListener('click', async (e) => {
        toggleButtons(false)

        const skipRequest = await fetch('/rankedle/skip', {
            method: 'POST'
        })

        if(skipRequest.ok) {
            const score = await skipRequest.json()
            update(score)
            resumeAudio()
        }
    })

    $btnSubmit.addEventListener('click', async (e) => {
        const $song = document.querySelector('#song')
        const value = $song.value
    
        $song.nextElementSibling.classList.remove('is-invalid')
        if(value.trim() === '') {
            $song.nextElementSibling.classList.add('is-invalid')
        } else {
            toggleButtons(false)

            const submitRequest = await fetch('/rankedle/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: parseInt(value)
                })
            })
        
            if(submitRequest.ok) {
                const score = await submitRequest.json()
                update(score)
                resumeAudio()
            }
        }
    })

    $btnEnd.addEventListener('click', async (e) => {
        $btnSkip.click()
    })

    const update = (score) => {
        const $steps = [...document.querySelectorAll('#rankedle .step')]
    
        if(score) {
            songChoice.clear()

            if(score.success === null) {
                for(let i = 0; i < $steps.length; i++) {
                    const detail = score.details[i] ?? null
    
                    $steps[i].classList.remove('step-active', 'text-red')
    
                    if(detail) {
                        let icon = ''
                        if(detail.status === 'skip') icon = skipIcon
                        if(detail.status === 'fail') {
                            icon = failIcon
                            $steps[i].classList.add('text-red')
                        }
                        $steps[i].innerHTML = icon + detail.data
                    }
                    if(i === score.skips && score.skips < 6) $steps[i].classList.add('step-active')
                    if(score.skips === 6) {
                        $btnSkip.classList.add('disabled')
                        $btnSubmit.classList.add('d-none')
                        $btnEnd.classList.remove('d-none')
                        songChoice.disable()
                    }
                }
                $skipSeconds.textContent = SKIPS[score.skips]
                const currentDuration = [...SKIPS.slice(0, score.skips)].reduce((p, c) => p + c) + 1
                $seekBarPlaceholder.style.width = `${currentDuration * 100 / 30}%`

                toggleButtons(true)
            } else {
                window.location.reload()
            }
        }
    }

    const songChoice = new TomSelect('#song', {
        copyClassesToDropdown: false,
        dropdownParent: 'body',
        controlInput: '<input>',
        placeholder: 'Vous reconnaissez ? Recherchez pour un·e artiste / titre',
        valueField: 'id',
        labelField: 'name',
        searchField: 'name',
        maxOptions: 5,
        load: (query, callback) => {
            fetch('/rankedle/songs?q=' + encodeURIComponent(query))
                .then(response => response.json())
                .then(json => {
                    callback(json)
                }).catch(() => {
                    callback()
                })
        },
        render:{
            item: function(data, escape) {
                if(data.customProperties) {
                    return '<div><span class="dropdown-item-indicator">' + data.customProperties + '</span>' + escape(data.name) + '</div>'
                }
                return '<div>' + escape(data.name) + '</div>'
            },
            option: function(data, escape) {
                if(data.customProperties) {
                    return '<div><span class="dropdown-item-indicator">' + data.customProperties + '</span>' + escape(data.name) + '</div>'
                }
                return '<div>' + escape(data.name) + '</div>'
            }
        }
    })
    
    document.addEventListener('DOMContentLoaded', async (e) => {
        const scoreRequest = await fetch('/rankedle/score')
    
        if(scoreRequest.ok) {
            const score = await scoreRequest.json()
            update(score)
        }
    })
}

document.addEventListener('DOMContentLoaded', async (e) => {
    // Volume
    const volumeSlider = noUiSlider.create(document.querySelector('#volume'), {
        start: window.localStorage.getItem('rankedleVolume') ? parseInt(window.localStorage.getItem('rankedleVolume')) : 50,
        connect: [true, false],
        step: 0.5,
        range: {
            min: 0,
            max: 100
        }
    })

    volumeSlider.on('update', (e) => {
        window.localStorage.setItem('rankedleVolume', e[0])
        audio.volume = parseInt(e[0]) / 100
    })
})