const $video = document.querySelector('#video')
const $runForm = document.querySelector('.form')
const $runModal = document.querySelector('#modalRun')
const $runModalUploadStatus = document.querySelector('#upload-status')
const $runModalUploadInfos = document.querySelector('#upload-infos')
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
    $runModalUploadInfos.textContent = ''
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
    } else {
        const file = $video.files[0]
        if(file.type !== 'video/mp4') {
            error = true
            message = 'Le format du fichier sélectionné n\'est pas autorisé'
        } else if(file.size > 3 * 1024 * 1024 * 1024) {
            error = true
            message = 'La taille du fichier ne doit pas exéder 3 Go'
        }
    }

    // Affichage du popup d'upload de run
    runModal.show()

    if(error) {
        $video.classList.add('is-invalid')
        $runModalUploadStatus.textContent = message
        $runModalCloseBtn.removeAttribute('disabled')
        $runModalUploadInfos.textContent = ''
        $runModalUploadProgress.classList.add('bg-danger')
        $runModalUploadProgress.style.width = '100%'
        $runModalUploadProgress.setAttribute('aria-valuenow', 100)
    } else {
        const formData = new FormData()
        formData.append('file', $video.files[0])

        // Affichage du popup d'upload de run
        runModal.show()

        const xhr = new XMLHttpRequest()
        xhr.responseType = 'json'

        xhr.onload = async () => {
            $runModalUploadStatus.textContent = xhr.response.message
            $runModalUploadInfos.textContent = ''
            $runModalCloseBtn.removeAttribute('disabled')
            $runModalUploadProgress.classList.add(`bg-${xhr.response.success ? 'success' : 'danger'}`)
            if(xhr.response.success) $runForm.reset()
        }

        xhr.upload.onerror = () => {
            $runModalUploadInfos.textContent = ''
            $runModalUploadProgress.classList.add('bg-danger')
            $runModalUploadStatus.textContent = 'Une erreur est survenue lors de l\'envoi du fichier vers le serveur'
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
            $runModalUploadInfos.textContent = `${mbytes.toFixed(2)}Mo/${(total / 1024 / 1024).toFixed(2)}Mo (${mbps.toFixed(2)}Mo/s)`
            $runModalUploadProgress.style.width = progress + '%'
            $runModalUploadProgress.setAttribute('aria-valuenow', progress)
        }

        xhr.open('POST', '/forms/run/mpov')

        xhr.send(formData)
    }
})