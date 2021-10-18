import '../../../scss/agent/google/redirect.scss'

const copyData = document.getElementById("copyData")

copyData.addEventListener("click", () => {
    navigator.clipboard.writeText(copyData.dataset.data)
    const html = copyData.innerHTML

    copyData.innerHTML = '<i class="fas fa-check"></i> Copier !'

    setTimeout(() => {
        copyData.innerHTML = html
    }, 5000)
})