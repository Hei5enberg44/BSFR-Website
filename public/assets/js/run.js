// Choix du formulaire (pc ou quest)
const $formRunPC = document.querySelector('#run-pc')
const $formRunQuest = document.querySelector('#run-quest')

const $btnConfirmBsVersion = document.querySelector('#btnConfirmBsVersion')
$btnConfirmBsVersion.addEventListener('click', function(e) {
    const choice = document.querySelector('[name="bsversion"]:checked')?.value
    showForm(choice)
})

const showForm = (choice) => {
    let $form
    switch(choice) {
        case 'pc':
            $form = $formRunPC
            break
        case 'quest':
            $form = $formRunQuest
            break
    }
    const $formsRun = document.querySelectorAll('.form-run')
    for(const $formRun of $formsRun) {
        $formRun.classList.add('d-none')
    }
    $form.classList.remove('d-none')
    localStorage.setItem('form', choice)
}

const showChoice = () => {
    const $formsRun = document.querySelectorAll('.form-run')
    for(const $formRun of $formsRun) {
        $formRun.classList.add('d-none')
    }
    document.querySelector('#run-choice').classList.remove('d-none')
}

// Affichage du formulaire choisi
const form = localStorage.getItem('form')
if(form)
    showForm(form)
else
    document.querySelector('#run-choice').classList.remove('d-none')

// Envoi de la run PC
const $commentaires = document.querySelector('#comments')
const $runPcForm = document.querySelector('#run-pc form')
const $btnClearFormPc = document.querySelector('.btn-clear-pc')
const $modalRunPc = document.querySelector('#modalRunPc')
const $modalRunPcStatus = $modalRunPc.querySelector('.modal-status')
const $modalRunPcIconSuccess = $modalRunPc.querySelector('svg.text-green')
const $modalRunPcIconFail = $modalRunPc.querySelector('svg.text-red')
const $modalRunPcUploadStatus = $modalRunPc.querySelector('#upload-status-pc')

const modalRunPc = new bootstrap.Modal($modalRunPc)

// Action à la fermeture du popup d'envoi de run
$modalRunPc.addEventListener('hidden.bs.modal', function() {
    $modalRunPcStatus.classList.remove('bg-success')
    $modalRunPcStatus.classList.remove('bg-danger')
    $modalRunPcIconSuccess.classList.add('d-none')
    $modalRunPcIconFail.classList.add('d-none')
    $modalRunPcUploadStatus.textContent = ''
})

// Nombre de caractères restants dans le champ « Commentaires sur la vidéo »
$commentaires.addEventListener('keyup', function() {
    document.querySelector('#remaining').innerText = this.maxLength - this.value.length
})

// Action à l'envoi du formulaire PC
$runPcForm.addEventListener('submit', async function(e) {
    e.preventDefault()

    const $url = this.querySelector('#url')
    const $description = this.querySelector('#description')
    const $leaderboard_profil = this.querySelector('#leaderboard_profil')
    const $map_leaderboard = this.querySelector('#map_leaderboard')
    const $beatsaver = this.querySelector('#beatsaver')
    const $headset = this.querySelector('#headset')
    const $grip = this.querySelector('#grip')
    const $twitch_url = this.querySelector('#twitch_url')
    const $comments = this.querySelector('#comments')

    $url.classList.remove('is-invalid')
    $description.classList.remove('is-invalid')
    $leaderboard_profil.classList.remove('is-invalid')
    $map_leaderboard.classList.remove('is-invalid')
    $beatsaver.classList.remove('is-invalid')
    $headset.classList.remove('is-invalid')
    $grip.classList.remove('is-invalid')
    $twitch_url.classList.remove('is-invalid')
    $comments.classList.remove('is-invalid')

    let error = false

    if($url.value === '') { error = true; $url.classList.add('is-invalid') }
    if($description.value === '') { error = true; $description.classList.add('is-invalid') }
    if($leaderboard_profil.value === '') { error = true; $leaderboard_profil.classList.add('is-invalid') }
    if($map_leaderboard.value === '') { error = true; $map_leaderboard.classList.add('is-invalid') }
    if($beatsaver.value === '') { error = true; $beatsaver.classList.add('is-invalid') }
    if($headset.value === '') { error = true; $headset.classList.add('is-invalid') }
    if($grip.value === '') { error = true; $grip.classList.add('is-invalid') }

    if(error) {
        alert('Veuillez compléter tous les champs requis')
    } else {
        const datas = {
            url: $url.value,
            description: $description.value,
            leaderboard_profil: $leaderboard_profil.value,
            map_leaderboard: $map_leaderboard.value,
            beatsaver: $beatsaver.value,
            headset: $headset.value,
            grip: $grip.value,
            twitch_url: $twitch_url.value,
            comments: $comments.value
        }

        const request = await fetch('/forms/run/pc', {
            method: 'POST',
            header: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datas)
        })

        const response = await request.json()

        $runPcForm.reset()

        if(response.error) {
            $modalRunPcStatus.classList.add('bg-danger')
            $modalRunPcIconFail.classList.remove('d-none')
            $modalRunPcUploadStatus.textContent = response.error
        } else {
            $modalRunPcStatus.classList.add('bg-success')
            $modalRunPcIconSuccess.classList.remove('d-none')
            $modalRunPcUploadStatus.textContent = response.success
        }

        modalRunPc.show()
    }
})

// Action au reset du formulaire PC
$btnClearFormPc.addEventListener('click', function() {
    $runPcForm.reset()
})

// Envoi de la run PC
const $commentairesQ = document.querySelector('#comments_q')
const $runQuestForm = document.querySelector('#run-quest form')
const $btnClearFormQuest = document.querySelector('.btn-clear-quest')
const $modalRunQuest = document.querySelector('#modalRunQuest')
const $modalRunQuestUploadStatus = $modalRunQuest.querySelector('#upload-status-quest')
const $modalRunQuestUploadInfos = $modalRunQuest.querySelector('#upload-infos-quest')
const $modalRunQuestUploadProgress = $modalRunQuest.querySelector('#upload-progress-quest')
const $modalRunQuestCloseBtn = $modalRunQuest.querySelector('#close-modal-run-quest')

const modalRunQuest = new bootstrap.Modal($modalRunQuest, {
    backdrop: 'static',
    keyboard: false
})

// Action à l'ouverture du popup d'upload de run
$modalRunQuest.addEventListener('show.bs.modal', function() {
    $modalRunQuestUploadStatus.textContent = 'Upload vers le serveur'
    $modalRunQuestCloseBtn.setAttribute('disabled', true)
})

// Action à la fermeture du popup d'upload de run
$modalRunQuest.addEventListener('hidden.bs.modal', function() {
    $modalRunQuestUploadStatus.textContent = ''
    $modalRunQuestUploadInfos.textContent = ''
    $modalRunQuestUploadProgress.classList.remove('bg-success')
    $modalRunQuestUploadProgress.classList.remove('bg-danger')
    $modalRunQuestUploadProgress.style.width = '0%'
    $modalRunQuestUploadProgress.setAttribute('aria-valuenow', 0)
    $modalRunQuestCloseBtn.removeAttribute('disabled')
})

// Action au clic sur le bouton de fermeture du popup d'upload de run
$modalRunQuestCloseBtn.addEventListener('click', function() {
    modalRunQuest.hide()
})

// Nombre de caractères restants dans le champ « Commentaires sur la vidéo »
$commentairesQ.addEventListener('keyup', function() {
    document.querySelector('#remaining_q').innerText = this.maxLength - this.value.length
})

// Action à l'envoi du formulaire Quest
$runQuestForm.addEventListener('submit', async function(e) {
    e.preventDefault()

    const $videoFile = this.querySelector('#video-file')
    const $audioFile = this.querySelector('#audio-file')
    const $description = this.querySelector('#description_q')
    const $leaderboard_profil = this.querySelector('#leaderboard_profil_q')
    const $map_leaderboard = this.querySelector('#map_leaderboard_q')
    const $beatsaver = this.querySelector('#beatsaver_q')
    const $headset = this.querySelector('#headset_q')
    const $grip = this.querySelector('#grip_q')
    const $twitch_url = this.querySelector('#twitch_url_q')
    const $comments = this.querySelector('#comments_q')

    $videoFile.classList.remove('is-invalid')
    $audioFile.classList.remove('is-invalid')
    $description.classList.remove('is-invalid')
    $leaderboard_profil.classList.remove('is-invalid')
    $map_leaderboard.classList.remove('is-invalid')
    $beatsaver.classList.remove('is-invalid')
    $headset.classList.remove('is-invalid')
    $grip.classList.remove('is-invalid')
    $twitch_url.classList.remove('is-invalid')
    $comments.classList.remove('is-invalid')

    let error = false, message = ''

    if(!$videoFile.file) { error = true; $videoFile.classList.add('is-invalid') }
    if(!$audioFile.file) { error = true; $audioFile.classList.add('is-invalid') }
    if($description.value === '') { error = true; $description.classList.add('is-invalid') }
    if($leaderboard_profil.value === '') { error = true; $leaderboard_profil.classList.add('is-invalid') }
    if($map_leaderboard.value === '') { error = true; $map_leaderboard.classList.add('is-invalid') }
    if($beatsaver.value === '') { error = true; $beatsaver.classList.add('is-invalid') }
    if($headset.value === '') { error = true; $headset.classList.add('is-invalid') }
    if($grip.value === '') { error = true; $grip.classList.add('is-invalid') }

    if(error) {
        alert('Veuillez compléter tous les champs requis')
    } else {
        modalRunQuest.show()

        const formData = new FormData()
        formData.append('video', $videoFile.file)
        formData.append('audio', $audioFile.file)
        formData.append('description', $description.value)
        formData.append('leaderboard_profil', $leaderboard_profil.value)
        formData.append('map_leaderboard', $map_leaderboard.value)
        formData.append('beatsaver', $beatsaver.value)
        formData.append('headset', $headset.value)
        formData.append('grip', $grip.value)
        formData.append('twitch_url', $twitch_url.value)
        formData.append('comments', $comments.value)

        const xhr = new XMLHttpRequest()
        xhr.responseType = 'json'

        xhr.onload = async () => {
            $modalRunQuestUploadStatus.textContent = xhr.response.message
            $modalRunQuestUploadInfos.textContent = ''
            $modalRunQuestCloseBtn.removeAttribute('disabled')
            $modalRunQuestUploadProgress.classList.add(`bg-${xhr.response.success ? 'success' : 'danger'}`)
            if(xhr.response.success) $runQuestForm.reset()
        }

        xhr.upload.onerror = () => {
            $modalRunQuestUploadInfos.textContent = ''
            $modalRunQuestUploadProgress.classList.add('bg-danger')
            $modalRunQuestUploadStatus.textContent = 'Une erreur est survenue lors de l\'envoi des fichiers vers le serveur'
        }

        let lastNow = new Date().getTime()
        let lastMBytes = 0
        xhr.upload.onprogress = (event) => {
            const now = new Date().getTime()
            const bytes = event.loaded
            const total = event.total
            const kbytes = bytes / 1024
            const mbytes = kbytes / 1024
            const uploadedMBytes = mbytes - lastMBytes
            const elapsed = (now - lastNow) / 1000
            const mbps =  elapsed ? uploadedMBytes / elapsed : 0 
            lastNow = now
            lastMBytes = mbytes

            const progress = event.loaded * 100 / event.total
            $modalRunQuestUploadInfos.textContent = `${mbytes.toFixed(2)}Mo/${(total / 1024 / 1024).toFixed(2)}Mo (${mbps.toFixed(2)}Mo/s)`
            $modalRunQuestUploadProgress.style.width = progress + '%'
            $modalRunQuestUploadProgress.setAttribute('aria-valuenow', progress)
        }

        xhr.open('POST', '/forms/run/quest')

        xhr.send(formData)
    }
})

// Action au reset du formulaire PC
$btnClearFormQuest.addEventListener('click', function() {
    $runQuestForm.reset()
})