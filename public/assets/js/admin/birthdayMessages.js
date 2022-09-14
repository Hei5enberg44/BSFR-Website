autosize(document.querySelector('#birthdayMessage'))

// Ajout/Édition d'un message d'anniversaire
const $modalAddOrEditBirthdayMessage = document.querySelector('#modalAddOrEditBirthdayMessage')
if($modalAddOrEditBirthdayMessage) {
    const modal = new bootstrap.Modal($modalAddOrEditBirthdayMessage)

    const $modalTitle = $modalAddOrEditBirthdayMessage.querySelector('.modal-title')
    const $modalAlert = $modalAddOrEditBirthdayMessage.querySelector('.modal-body .alert')
    const $birthdayMessageId = $modalAddOrEditBirthdayMessage.querySelector('#editBirthdayMessageId')
    const $birthdayMessage = $modalAddOrEditBirthdayMessage.querySelector('#birthdayMessage')

    $modalAddOrEditBirthdayMessage.addEventListener('hidden.bs.modal', function() {
        const $confirmBtn = this.querySelector('#addOrEditBirthayMessage')
        $modalTitle.textContent = ''
        $birthdayMessageId.value = ''
        $birthdayMessage.value = ''
        $confirmBtn.textContent = ''
        $confirmBtn.replaceWith($confirmBtn.cloneNode(true))
    })

    $modalAddOrEditBirthdayMessage.addEventListener('show.bs.modal', async function() {
        const $confirmBtn = this.querySelector('#addOrEditBirthayMessage')
        if($birthdayMessageId.value === '') {
            $modalTitle.textContent = 'Ajouter un message d\'anniversaire'
            $confirmBtn.textContent = 'Ajouter'
            $confirmBtn.addEventListener('click', async () => {
                await addBirthdayMessage()
            })
        } else {
            $modalTitle.textContent = 'Modifier un message d\'anniversaire'
            $confirmBtn.textContent = 'Modifier'
            $confirmBtn.addEventListener('click', async () => {
                await editBirthdayMessage()
            })
        }
    })

    const addBirthdayMessage = async () => {
        $birthdayMessage.classList.remove('is-invalid')
        $modalAlert.classList.add('d-none')

        if($birthdayMessage.value !== '') {
            const addRequest = await fetch('/admin/birthdayMessage', {
                method: 'POST',
                body: JSON.stringify({
                    message: $birthdayMessage.value
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if(addRequest.ok) {
                modal.hide()
                location.reload()
            }
        } else {
            $birthdayMessage.classList.add('is-invalid')
            $modalAlert.classList.remove('d-none')
            $modalAlert.querySelector('.text-muted').textContent = 'Le message ne peut pas être vide'
        }
    }

    document.querySelectorAll('.edit-birthday-message').forEach($btnEdit => {
        $btnEdit.addEventListener('click', async function() {
            const getRequest = await fetch(`/admin/birthdayMessage/${this.dataset.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
    
            if(getRequest.ok) {
                const birthdayMessage = await getRequest.json()
                if(birthdayMessage) {
                    $birthdayMessageId.value = birthdayMessage.id
                    $birthdayMessage.value = birthdayMessage.message
                    modal.show()
                }
            }
        })
    })

    const editBirthdayMessage = async () => {
        $birthdayMessage.classList.remove('is-invalid')
        $modalAlert.classList.add('d-none')

        if($birthdayMessage.value !== '') {
            const editRequest = await fetch(`/admin/birthdayMessage/${$birthdayMessageId.value}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    message: $birthdayMessage.value
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if(editRequest.ok) {
                modal.hide()
                location.reload()
            }
        } else {
            $birthdayMessage.classList.add('is-invalid')
            $modalAlert.classList.remove('d-none')
            $modalAlert.querySelector('.text-muted').textContent = 'Le message ne peut pas être vide'
        }
    }
}

// Suppression d'un message d'anniversaire
const $modalDeleteBirthdayMessage = document.querySelector('#modalDeleteBirthdayMessage')
if($modalDeleteBirthdayMessage) {
    const modal = new bootstrap.Modal($modalDeleteBirthdayMessage)

    const $birthdayMessageId = $modalDeleteBirthdayMessage.querySelector('#deleteBirthdayMessageId')
    const $birthdayMessage = $modalDeleteBirthdayMessage.querySelector('#deleteBirthdayMessage')

    $modalDeleteBirthdayMessage.addEventListener('hidden.bs.modal', function() {
        $birthdayMessageId.value = ''
        $birthdayMessage.textContent = ''
    })

    $modalDeleteBirthdayMessage.addEventListener('show.bs.modal', async function() {
        const $confirmBtn = this.querySelector('#deleteBirthayMessage')
        if($birthdayMessageId.value !== '') {
            $confirmBtn.addEventListener('click', async () => {
                await deleteBirthdayMessage()
            })
        }
    })

    document.querySelectorAll('.delete-birthday-message').forEach($btnEdit => {
        $btnEdit.addEventListener('click', async function() {
            const getRequest = await fetch(`/admin/birthdayMessage/${this.dataset.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
    
            if(getRequest.ok) {
                const birthdayMessage = await getRequest.json()
                if(birthdayMessage) {
                    $birthdayMessageId.value = birthdayMessage.id
                    $birthdayMessage.innerHTML = birthdayMessage.message.replace(/\n/g, '<br>')
                    modal.show()
                }
            }
        })
    })

    const deleteBirthdayMessage = async () => {
        const deleteRequest = await fetch(`/admin/birthdayMessage/${$birthdayMessageId.value}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if(deleteRequest.ok) {
            modal.hide()
            location.reload()
        }
    }
}