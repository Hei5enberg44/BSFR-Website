function showAlert(success, message) {
    if(message !== '') {
        const alertElem = document.createElement('div')
        alertElem.setAttribute('class', 'alert alert-' + (success ? 'success' : 'danger'))
        alertElem.append(document.createTextNode(unescape(message)))

        document.body.append(alertElem)

        fadeIn(alertElem, 'block')

        setTimeout(function() { fadeOut(alertElem) }, 3000)
    }
}

function fadeIn(el, display) {
    el.style.opacity = 0;
    el.style.display = display || 'block';
    (function fade() {
        var val = parseFloat(el.style.opacity);
        if (!((val += .1) > 1)) {
            el.style.opacity = val;
            requestAnimationFrame(fade);
        }
    })();
}

function fadeOut(el) {
    el.style.opacity = 1;
    (function fade() {
        if ((el.style.opacity -= .1) < 0) {
            el.style.display = 'none';
        } else {
            requestAnimationFrame(fade);
        }
    })();
}