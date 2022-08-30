const $commentaires = document.querySelector('#comments')
const $runForm = document.querySelector('.form')
const $btnClear = document.querySelector('.btn-clear')
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

// Action à l'envoi du formulaire
$runForm.addEventListener('submit', async function(e) {
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

        $runForm.reset()

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

// Action au reset du formulaire
$btnClear.addEventListener('click', function() {
    $runForm.reset()
})