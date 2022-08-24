const $video = document.querySelector('#video')
const $runForm = document.querySelector('.form')
const $btnClear = document.querySelector('.btn-clear')
const $runModal = document.querySelector('#modalRun')
const $runModalUploadStatus = document.querySelector('#upload-status')
const $runModalUploadProgress = document.querySelector('#upload-progress')
const $runModalCloseBtn = document.querySelector('#close-modal-run')

const runModal = new bootstrap.Modal($runModal, {
    backdrop: 'static',
    keyboard: false
})

// Action à l'ouverture du popup d'upload de run
$runModal.addEventListener('show.bs.modal', function() {
    $runModalUploadStatus.textContent = 'Upload vers le serveur'
    $runModalCloseBtn.setAttribute('disabled', true)
})

// Action à la fermeture du popup d'upload de run
$runModal.addEventListener('hidden.bs.modal', function() {
    $runModalUploadStatus.textContent = ''
    $runModalUploadProgress.classList.remove('bg-success')
    $runModalUploadProgress.classList.remove('bg-danger')
    $runModalUploadProgress.style.width = '0%'
    $runModalUploadProgress.setAttribute('aria-valuenow', 0)
    $runModalCloseBtn.removeAttribute('disabled')
})

// Action au clic sur le bouton de fermeture du popup d'upload de run
$runModalCloseBtn.addEventListener('click', function() {
    runModal.hide()
})

// Action à l'envoi du formulaire
$runForm.addEventListener('submit', async function(e) {
    e.preventDefault()

    $video.classList.remove('is-invalid')

    let error = false, message = ''
    if($video.files.length === 0) {
        error = true
        message = 'Veuillez sélectionner un fichier'
        $video.classList.add('is-invalid')
    } else {
        const file = $video.files[0]
        if(!file.type.match(/^video\//)) {
            error = true
            message = 'Le format du fichier sélectionné n\'est pas autorisé'
            $video.classList.add('is-invalid')
        } else if(file.size > 3 * 1024 * 1024 * 1024) {
            error = true
            message = 'La taille du fichier ne doit pas exéder 3 Go'
            $video.classList.add('is-invalid')
        }
    }

    // Affichage du popup d'upload de run
    runModal.show()

    if(error) {
        $runModalUploadStatus.textContent = message
        $runModalCloseBtn.removeAttribute('disabled')
    } else {
        const formData = new FormData()
        formData.append('files', $video.files[0])

        // Affichage du popup d'upload de run
        runModal.show()

        const xhr = new XMLHttpRequest()
        xhr.responseType = 'json'

        xhr.onload = async () => {
            $runModalUploadStatus.textContent = xhr.response.message
            $runModalCloseBtn.removeAttribute('disabled')

            if(!xhr.response.success) {
                $runModalUploadProgress.classList.add('bg-danger')
            } else {
                $runModalUploadProgress.classList.add('bg-success')

                $runForm.reset()

                const token = xhr.response.token
                const file = xhr.response.file

                await fetch('/forms/run/mpov/upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        token: token,
                        file: file
                    })
                })
            }
        }

        xhr.upload.onerror = () => {
            $runModalUploadProgress.classList.add('bg-danger')
            $runModalUploadStatus.textContent = 'Une erreur est survenue lors de l\'envoi du fichier vers le serveur'
        }

        xhr.upload.onprogress = (event) => {
            const progress = event.loaded * 100 / event.total
            $runModalUploadProgress.style.width = progress + '%'
            $runModalUploadProgress.setAttribute('aria-valuenow', progress)
        }

        xhr.open('POST', '/forms/run/mpov')

        xhr.send(formData)
    }
})

// Action au reset du formulaire
$btnClear.addEventListener('click', function() {
    $runForm.reset()
})