
class FileUpload extends HTMLElement {
    /** @type {HTMLInputElement} */
    #input
    /** @type {string} */
    #placeholder
    /** @type {File} */
    file = null

    constructor() {
        super()
        this.init()
    }

    init() {
        this.setAttribute('draggable', '')

        const input = document.createElement('input')
        input.type = 'file'
        this.#input = input
        this.append(input)
        input.addEventListener('change', (e) => this.uploadFile())

        this.#placeholder = this.textContent

        this.addEventListener('click', (e) => this.click(e))
        this.addEventListener('dragover', (e) => e.preventDefault())
        this.addEventListener('dragenter', function(e) {
            this.dragEnter(e)
        })
        this.addEventListener('dragleave', (e) => this.dragLeave())
        this.addEventListener('drop', function(e) {
            e.preventDefault()
            this.drop(e)
        })
    }

    /**
     * Action au clic
     * @param {MouseEvent} e
     */
    click(e) {
        this.#input.click()
    }

    /**
     * Action à l'entrée du survol
     * @param {DragEvent} e
     */
    dragEnter(e) {
        this.classList.add('drag-over')
    }

    /**
     * Action à la sortie du survol
     */
    dragLeave() {
        this.classList.remove('drag-over')
    }

    /**
     * Action lorsque le fichier est déposé
     * @param {DragEvent} e
     */
    drop(e) {
        const files = e.dataTransfer.files
        const file = files[0]
        this.processFile(file)
    }

    /**
     * Action à l'upload d'un fichier via l'input file
     * @param {Event} e
     */
    uploadFile() {
        const files = this.#input.files
        const file = files[0]
        this.processFile(file)
    }

    /**
     * Traitement du fichier uploadé
     * @param {File} file
     */
    processFile(file) {
        let valid = true
        const fileName = file.name
        const fileType = file.type
        const fileSize = file.size

        this.removeAttribute('class')

        const autorizedTypes = this.getAttribute('file-types') ? this.getAttribute('file-types').split(' ') : null
        if(autorizedTypes) {
            if(autorizedTypes.indexOf(fileType) === -1) {
                valid = false
                this.classList.add('is-invalid')
                this.textContent = 'Format de fichier non autorisé'
            }
        }

        const maxSize = this.getAttribute('max-size') ? parseInt(this.getAttribute('max-size')) : null
        if(maxSize) {
            if(fileSize > maxSize) {
                valid = false
                this.classList.add('is-invalid')
                this.textContent = 'Le fichier est trop volumineux'
            }
        }

        if(valid) {
            this.classList.add('is-valid')
            this.textContent = fileName
            this.file = file
        }
    }

    /**
     * Réinitialise le champ
     */
    reset() {
        this.file = null
        this.#input.value = ''
        this.textContent = this.#placeholder
        this.removeAttribute('class')
    }
}

customElements.define('file-upload', FileUpload);