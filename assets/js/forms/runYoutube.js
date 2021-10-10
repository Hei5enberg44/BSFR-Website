import '../../scss/forms/runYoutube.scss'

const eraseForm = document.getElementById("eraseForm")

eraseForm.addEventListener("click", () => {
    if(confirm("Êtes-vous sûr de vouloir effacer le formulaire ?")) {
        const inputs = document.getElementsByTagName("input")

        for (const input of inputs) {
            input.value = ""
        }
    }
})