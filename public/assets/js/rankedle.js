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
/** @type {HTMLButtonElement} */
const $btnShare = document.querySelector('#share')
/** @type {HTMLButtonElement} */
const $btnStats = document.querySelector('#stats')
/** @type {HTMLDivElement} */
const $modalStats = document.querySelector('#modalStats')
/** @type {HTMLDivElement} */
const $progress = document.querySelector('#progress')
/** @type {HTMLDivElement} */
const $seekCursor = document.querySelector('#seek-cursor')

const SONG_URL = '/rankedle/song'

const audio = new Audio(SONG_URL)

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

if($playBtn) {
    $playBtn.addEventListener('click', (e) => {
        const isPlaying = audio.currentTime > 0 && !audio.paused && !audio.ended && audio.readyState > audio.HAVE_CURRENT_DATA
        if(!isPlaying)
            playAudio()
        else
            stopAudio()
    })

    document.addEventListener('DOMContentLoaded', async (e) => {
        // Volume
        const volumeSlider = noUiSlider.create(document.querySelector('#volume'), {
            start: window.localStorage.getItem('rankedleVolume') ? parseInt(window.localStorage.getItem('rankedleVolume')) : 25,
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
                songChoice.removeOption(value)
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
                        $steps[i].innerHTML = icon + detail.text
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
        openOnFocus: false,
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

if($btnStats) {
    $btnStats.addEventListener('click', async (e) => {
        $btnStats.classList.add('btn-loading')
        await getUserStats()
        $btnStats.classList.remove('btn-loading')
    })

    const $playerStats = [...document.querySelectorAll('.player-stats')]
    for(const $playerStat of $playerStats) {
        $playerStat.addEventListener('click', async (e) => {
            e.preventDefault()

            const memberId = $playerStat.dataset.memberId
            await getUserStats(memberId)
        })
    }

    const getUserStats = async (userId = null) => {
        const statsRequest = await fetch(`/rankedle/stats${userId ? `?userId=${userId}` : ''}`)
    
        if(statsRequest.ok) {
            const stats = await statsRequest.json()

            if(stats) {
                $modalStats.querySelector('#stats-played').textContent = stats.played
                $modalStats.querySelector('#stats-win-rate').textContent = Math.round(stats.won * 100 / stats.played)
                $modalStats.querySelector('#stats-current-streak').textContent = stats.currentStreak
                $modalStats.querySelector('#stats-max-streak').textContent = stats.maxStreak

                for(let i = 1; i <= 7; i++) {
                    const tries = i !== 7 ? stats[`try${i}`] : stats.played - stats.won
                    const $statSkip = i !== 7 ? document.querySelector(`#stats-try-${i}`) : document.querySelector(`#stats-loses`)
                    $statSkip.querySelector('.progressbg-text').textContent = tries
                    if(tries > 0) {
                        const progress = Math.round(tries * 100 / stats.played)
                        $statSkip.querySelector('.progress-bar').classList.remove('bg-secondary')
                        $statSkip.querySelector('.progress-bar').classList.add(i !== 7 ? 'bg-success' : 'bg-danger')
                        $statSkip.querySelector('.progress-bar').style.width = `${progress >= 5.5 ? progress : 5.5}%`
                    } else {
                        $statSkip.querySelector('.progress-bar').classList.remove('bg-success', 'bg-danger')
                        $statSkip.querySelector('.progress-bar').classList.add('bg-secondary')
                        $statSkip.querySelector('.progress-bar').style.width = '5.5%'
                    }
                }
            }
        }

        const modalStats = bootstrap.Modal.getOrCreateInstance($modalStats)
        modalStats.show()
    }
}

if($btnShare) {
    let copiedTimeout = null

    $btnShare.addEventListener('click', async (e) => {
        $btnShare.classList.add('btn-loading')

        const shareRequest = await fetch('/rankedle/share')
    
        if(shareRequest.ok) {
            const result = await shareRequest.text()
            const $textArea = document.createElement('textarea')
            $textArea.style.position = 'absolute'
            $textArea.style.top = -9999
            $textArea.style.opacity = 0
            $textArea.value = result
            document.body.append($textArea)
            $textArea.select()
            document.execCommand('copy')
            $textArea.remove()

            $btnShare.querySelector('span').textContent = 'Copié !'
            if(copiedTimeout) clearTimeout(copiedTimeout)
            copiedTimeout = setTimeout(() => {
                $btnShare.querySelector('span').textContent = 'Partager'
            }, 2000)
        }

        $btnShare.classList.remove('btn-loading')
    })
}