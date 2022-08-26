function showAlert(success, message) {
    const $row = document.createElement('div')
    $row.classList.add('row', 'alert-login')
    const $col = document.createElement('div')
    $col.classList.add('col-12', 'd-flex', 'justify-content-center')
    const $alert = document.createElement('div')
    $alert.classList.add('alert', `alert-${success ? 'success' : 'danger'}`, 'bg-white', 'animate__animated', 'animate__bounceInDown')
    $alert.setAttribute('role', 'alert')
    const $alertMessage = document.createElement('div')
    $alertMessage.classList.add('text-muted')
    $alertMessage.textContent = message

    $alert.append($alertMessage)
    $col.append($alert)
    $row.append($col)

    document.body.prepend($row)

    setTimeout(function() {
        $alert.classList.remove('animate__bounceInDown')
        $alert.classList.add('animate__bounceOutUp')
        setTimeout(function() {
            $row.remove()
        }, 1000)
    }, 2000)
}