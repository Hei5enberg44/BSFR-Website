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
const $runModal = document.querySelector('#modalRun')
const $modalStatus = $runModal.querySelector('.modal-status')
const $modalIconSuccess = $runModal.querySelector('svg.text-green')
const $modalIconFail = $runModal.querySelector('svg.text-red')
const $runModalUploadStatus = document.querySelector('#upload-status')

const runModal = new bootstrap.Modal($runModal)

// Action à la fermeture du popup d'envoi de run
$runModal.addEventListener('hidden.bs.modal', function() {
    $modalStatus.classList.remove('bg-success')
    $modalStatus.classList.remove('bg-danger')
    $modalIconSuccess.classList.add('d-none')
    $modalIconFail.classList.add('d-none')
    $runModalUploadStatus.textContent = ''
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

        const request = await fetch('/forms/run/youtube', {
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
            $modalStatus.classList.add('bg-danger')
            $modalIconFail.classList.remove('d-none')
            $runModalUploadStatus.textContent = response.error
        } else {
            $modalStatus.classList.add('bg-success')
            $modalIconSuccess.classList.remove('d-none')
            $runModalUploadStatus.textContent = response.success
        }

        runModal.show()
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


// Nombre de caractères restants dans le champ « Commentaires sur la vidéo »
$commentairesQ.addEventListener('keyup', function() {
    document.querySelector('#remaining_q').innerText = this.maxLength - this.value.length
})

// Action à l'envoi du formulaire Quest
$runQuestForm.addEventListener('submit', async function(e) {
    e.preventDefault()

    // const $url = this.querySelector('#url')
    const $description = this.querySelector('#description_q')
    const $leaderboard_profil = this.querySelector('#leaderboard_profil_q')
    const $map_leaderboard = this.querySelector('#map_leaderboard_q')
    const $beatsaver = this.querySelector('#beatsaver_q')
    const $headset = this.querySelector('#headset_q')
    const $grip = this.querySelector('#grip_q')
    const $twitch_url = this.querySelector('#twitch_url_q')
    const $comments = this.querySelector('#comments_q')

    // $url.classList.remove('is-invalid')
    $description.classList.remove('is-invalid')
    $leaderboard_profil.classList.remove('is-invalid')
    $map_leaderboard.classList.remove('is-invalid')
    $beatsaver.classList.remove('is-invalid')
    $headset.classList.remove('is-invalid')
    $grip.classList.remove('is-invalid')
    $twitch_url.classList.remove('is-invalid')
    $comments.classList.remove('is-invalid')

    let error = false

    // if($url.value === '') { error = true; $url.classList.add('is-invalid') }
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
            // url: $url.value,
            description: $description.value,
            leaderboard_profil: $leaderboard_profil.value,
            map_leaderboard: $map_leaderboard.value,
            beatsaver: $beatsaver.value,
            headset: $headset.value,
            grip: $grip.value,
            twitch_url: $twitch_url.value,
            comments: $comments.value
        }

        const request = await fetch('/forms/run/youtube', {
            method: 'POST',
            header: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datas)
        })

        const response = await request.json()

        $runQuestForm.reset()

        if(response.error) {
            $modalStatus.classList.add('bg-danger')
            $modalIconFail.classList.remove('d-none')
            $runModalUploadStatus.textContent = response.error
        } else {
            $modalStatus.classList.add('bg-success')
            $modalIconSuccess.classList.remove('d-none')
            $runModalUploadStatus.textContent = response.success
        }

        runModal.show()
    }
})

// Action au reset du formulaire PC
$btnClearFormQuest.addEventListener('click', function() {
    $runQuestForm.reset()
})