import "../scss/general.scss"

require("bootstrap")
require('@fortawesome/fontawesome-free/css/all.min.css');
require('@fortawesome/fontawesome-free/js/all.js');

const flashes = document.getElementsByClassName("flash")

for(const flash of flashes) {
    setTimeout(() => {
        flash.style.opacity = 0
    }, 5000)
}



