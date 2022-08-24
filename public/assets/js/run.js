const $commentaires = document.querySelector('#comments')
const $runForm = document.querySelector('.form')
const $btnClear = document.querySelector('.btn-clear')

// Nombre de caractères restants dans le champ « Commentaires sur la vidéo »
$commentaires.addEventListener('keyup', function() {
    document.querySelector('#remaining').innerText = this.maxLength - this.value.length
})

// Action à l'envoi du formulaire
$runForm.addEventListener('submit', async function(e) {
    e.preventDefault()

    const $url = this.querySelector('#url')
    const $description = this.querySelector('#description')
    const $scoresaber_profil = this.querySelector('#scoresaber_profil')
    const $scoresaber_leaderboard = this.querySelector('#scoresaber_leaderboard')
    const $beatsaver = this.querySelector('#beatsaver')
    const $headset = this.querySelector('#headset')
    const $grip = this.querySelector('#grip')
    const $twitch_url = this.querySelector('#twitch_url')
    const $comments = this.querySelector('#comments')

    $url.classList.remove('is-invalid')
    $description.classList.remove('is-invalid')
    $scoresaber_profil.classList.remove('is-invalid')
    $scoresaber_leaderboard.classList.remove('is-invalid')
    $beatsaver.classList.remove('is-invalid')
    $headset.classList.remove('is-invalid')
    $grip.classList.remove('is-invalid')
    $twitch_url.classList.remove('is-invalid')
    $comments.classList.remove('is-invalid')

    let error = false

    if($url.value === '') { error = true; $url.classList.add('is-invalid') }
    if($description.value === '') { error = true; $description.classList.add('is-invalid') }
    if($scoresaber_profil.value === '') { error = true; $scoresaber_profil.classList.add('is-invalid') }
    if($scoresaber_leaderboard.value === '') { error = true; $scoresaber_leaderboard.classList.add('is-invalid') }
    if($beatsaver.value === '') { error = true; $beatsaver.classList.add('is-invalid') }
    if($headset.value === '') { error = true; $headset.classList.add('is-invalid') }
    if($grip.value === '') { error = true; $grip.classList.add('is-invalid') }

    if(error) {
        alert('Veuillez compléter tous les champs requis')
    } else {
        const datas = {
            url: $url.value,
            description: $description.value,
            scoresaber_profil: $scoresaber_profil.value,
            scoresaber_leaderboard: $scoresaber_leaderboard.value,
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

        showAlert(response.error ? false : true, response.error ? response.error : response.success)
    }
})

// Action au reset du formulaire
$btnClear.addEventListener('click', function() {
    $runForm.reset()
})