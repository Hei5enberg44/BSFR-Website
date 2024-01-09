window.addEventListener('DOMContentLoaded', async () => {
    const twitter = await (await fetch('/static/assets/libs/emoji-mart/twitter.json')).json()
    EmojiMart.init({ data: twitter })
})

const SKIPS = [ 1, 2, 3, 4, 5, 14, 0 ]
const playIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" /></svg>'
const stopIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="currentColor" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 4h-10a3 3 0 0 0 -3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3 -3v-10a3 3 0 0 0 -3 -3z" /></svg>'
const skipIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 5v14l12 -7z" /><path d="M20 5l0 14" /></svg>'
const failIcon = '<svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24" viewBox="0 0 24 24" stroke-width="1" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>'

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
const $btnHint = document.querySelector('#hint')
/** @type {HTMLButtonElement} */
const $btnRedeemHint = document.querySelector('#redeemHint')
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
const $modalHistory = document.querySelector('#modalHistory')
/** @type {HTMLDivElement} */
const $progress = document.querySelector('#progress')
/** @type {HTMLDivElement} */
const $seekCursor = document.querySelector('#seek-cursor')
/** @type {HTMLSpanElement} */
const $countdown = document.querySelector('#countdown')

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
        } else {
            toggleButtons(true)
            showAlert(false, skipRequest.headers.get('X-Status-Message') ?? '', 5000)
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
            } else {
                toggleButtons(true)
                showAlert(false, submitRequest.headers.get('X-Status-Message') ?? '', 5000)
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
                if(score.details) {
                    for(let i = 0; i < $steps.length; i++) {
                        const $stepIcon = $steps[i].querySelector('.step-icon')
                        const $stepText = $steps[i].querySelector('.step-text')
                        const detail = score.details[i] ?? null
        
                        $steps[i].classList.remove('step-active')
        
                        if(detail) {
                            let icon = ''
                            if(detail.status === 'skip') {
                                icon = skipIcon
                                $steps[i].classList.add('step-skip')
                            }
                            if(detail.status === 'fail') {
                                icon = failIcon
                                $steps[i].classList.add('step-fail')
                            }
                            $stepIcon.innerHTML = icon
                            $stepText.textContent = detail.text
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
                }

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
        render: {
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

if($btnHint) {
    const $modalHintConfirm = document.querySelector('#modalHintConfirm')
    const $modalHint = document.querySelector('#modalHint')
    const modalHintConfirm = bootstrap.Modal.getOrCreateInstance($modalHintConfirm)
    const modalHint = bootstrap.Modal.getOrCreateInstance($modalHint)

    $btnHint.addEventListener('click', async () => {
        $btnHint.classList.add('btn-loading')

        const hintRequest = await fetch('/rankedle/hint')

        if(hintRequest.ok) {
            const hint = await hintRequest.json()
            if(!hint) {
                modalHintConfirm.show()
            } else {
                await showHint(hint)
            }
        } else {
            showAlert(false, hintRequest.headers.get('X-Status-Message') ?? '', 5000)
        }

        $btnHint.classList.remove('btn-loading')
    })

    $btnRedeemHint.addEventListener('click', async () => {
        $btnRedeemHint.classList.add('btn-loading')

        const hintRequest = await fetch('/rankedle/hint', {
            method: 'POST'
        })

        if(hintRequest.ok) {
            const hint = await hintRequest.json()
            await showHint(hint)
        } else {
            showAlert(false, hintRequest.headers.get('X-Status-Message') ?? '', 5000)
        }

        $btnRedeemHint.classList.remove('btn-loading')
    })

    const showHint = async () => {
        const hintRequest = await fetch('/rankedle/hint', {
            method: 'POST'
        })

        if(hintRequest.ok) {
            const hint = await hintRequest.json()

            const $hintContent = $modalHint.querySelector('#hintContent')
            const $img = document.createElement('img')
            $img.src = `data:image/webp;base64,${hint.cover}`
            $hintContent.innerHTML = ''
            $hintContent.append($img)

            modalHintConfirm.hide()
            modalHint.show()
        } else {
            showAlert(false, hintRequest.headers.get('X-Status-Message') ?? '', 5000)
        }
    }
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

            const modalStats = bootstrap.Modal.getOrCreateInstance($modalStats)
            modalStats.show()
        } else {
            showAlert(false, statsRequest.headers.get('X-Status-Message') ?? '', 5000)
        }
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
        } else {
            showAlert(false, shareRequest.headers.get('X-Status-Message') ?? '', 5000)
        }

        $btnShare.classList.remove('btn-loading')
    })
}

if($modalHistory) {
    const modalHistory = bootstrap.Modal.getOrCreateInstance($modalHistory)

    /** @type {HTMLDivElement} */
    const $tableHistory = $modalHistory.querySelector('#table-history')
    /** @type {HTMLDivElement} */
    const $modalBody = $modalHistory.querySelector('.modal-body')
    /** @type {HTMLButtonElement} */
    const $historyPrev = $modalHistory.querySelector('#history-prev')
    /** @type {HTMLButtonElement} */
    const $historyNext = $modalHistory.querySelector('#history-next')

    $modalHistory.addEventListener('show.bs.modal', async () => {
        $modalBody.classList.remove('d-none')
        $tableHistory.classList.add('d-none')
    })

    $modalHistory.addEventListener('shown.bs.modal', async () => {
        const historyData = await getHistory()
        showHistory(historyData)
    })

    $historyPrev.addEventListener('click', async () => {
        $historyPrev.classList.add('btn-loading')
        const historyData = await getHistory(parseInt($historyPrev.dataset.page))
        showHistory(historyData)
        $historyPrev.classList.remove('btn-loading')
    })

    $historyNext.addEventListener('click', async () => {
        $historyNext.classList.add('btn-loading')
        const historyData = await getHistory(parseInt($historyNext.dataset.page))
        showHistory(historyData)
        $historyNext.classList.remove('btn-loading')
    })

    const getHistory = async (page = 0) => {
        const historyRequest = await fetch(`/rankedle/history?page=${page}`, {
            method: 'GET'
        })

        if(historyRequest.ok) {
            const history = await historyRequest.json()
            return history
        } else {
            showAlert(false, historyRequest.headers.get('X-Status-Message') ?? '', 5000)
        }

        return null
    }

    const showHistory = (historyData) => {
        if(historyData) {
            const { total, page, history } = historyData

            const $tbody = $tableHistory.querySelector('.table-tbody')
            $tbody.innerHTML = ''

            for(const historyEntrie of history) {
                const $tr = document.createElement('tr')
                const $tdN = document.createElement('td')
                $tdN.style.width = '1px'
                $tdN.textContent = `#${historyEntrie.id}`
                const $avatar = document.createElement('div')
                $avatar.classList.add('avatar', 'avatar-lg')
                $avatar.style.backgroundImage = `url(${historyEntrie.cover})`
                const $tdMap = document.createElement('td')
                const $tdMapRow = document.createElement('div')
                $tdMapRow.classList.add('row', 'align-items-center')
                const $tdMapCover = document.createElement('div')
                $tdMapCover.classList.add('col-auto')
                $tdMapCover.append($avatar)
                const $tdMapName = document.createElement('div')
                $tdMapName.classList.add('col', 'text-truncate')
                $tdMapName.textContent = historyEntrie.songName
                $tdMapRow.append($tdMapCover, $tdMapName)
                $tdMap.append($tdMapRow)
                const $tdMapper = document.createElement('td')
                $tdMapper.textContent = historyEntrie.levelAuthorName
                const $tdScore = document.createElement('td')
                $tdScore.style.minWidth = '175px'
                if(historyEntrie.score) {
                    $tdScore.innerHTML = historyEntrie.score.map(s => `<em-emoji native="${s}" set="twitter"></em-emoji>`).join(' ')
                }
                const $tdDate = document.createElement('td')
                $tdDate.textContent = historyEntrie.date
                $tr.append($tdN, $tdMap, $tdMapper, $tdScore, $tdDate)
                $tbody.append($tr)
            }

            const $modalBody = $modalHistory.querySelector('.modal-body')
            $modalBody.classList.add('d-none')
            $tableHistory.classList.remove('d-none')

            if(page > 0) {
                $historyPrev.classList.remove('disabled')
                $historyPrev.dataset.page = page - 1
            } else {
                $historyPrev.classList.add('disabled')
                delete $historyPrev.dataset.page
            }

            if(page < Math.ceil(total / 8) - 1) {
                $historyNext.classList.remove('disabled')
                $historyNext.dataset.page = page + 1
            } else {
                $historyNext.classList.add('disabled')
                delete $historyNext.dataset.page
            }
        }
    }
}

if($countdown) {
    const nextRankedleDate = new Date()
    nextRankedleDate.setDate(nextRankedleDate.getDate() + 1)
    nextRankedleDate.setHours(0, 0, 0, 0)

    const updateCountdown = () => {
        const date = new Date()
        const diff = nextRankedleDate.getTime() - date.getTime()

        if(diff >= 0) {
            const hoursLeft = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const secondsLeft = Math.floor((diff % (1000 * 60)) / 1000)
            
            $countdown.textContent = `${hoursLeft < 10 ? '0' : ''}${hoursLeft}:${minutesLeft < 10 ? '0' : ''}${minutesLeft}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`
        } else {
            $countdown.textContent = '00:00:00'
        }
    }

    updateCountdown()
    setInterval(updateCountdown, 1000)
}