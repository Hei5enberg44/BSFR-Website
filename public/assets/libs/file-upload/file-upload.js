class FileUpload extends HTMLElement {
    /** @type {HTMLInputElement} */
    #input
    /** @type {string} */
    #placeholder
    /** @type {File} */
    file = null
    /** @type {array} */
    #autorizedFileTypes = []
    /** @type {array} */
    #autorizedFileExtensions = []
    /** @type {number} */
    #maxFileSize = 0

    constructor() {
        super()
        this.init()
    }

    init() {
        this.setAttribute('draggable', '')

        if(this.getAttribute('file-types')) this.#autorizedFileTypes = this.getAttribute('file-types').split(',')
        if(this.getAttribute('accept')) this.#autorizedFileExtensions = this.getAttribute('accept').split(',')
        if(this.getAttribute('max-size')) this.#maxFileSize = parseInt(this.getAttribute('max-size'))

        const input = document.createElement('input')
        input.type = 'file'
        input.accept = this.getAttribute('accept')
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
        const fileExtension = fileName.split('.').pop()
        const fileSize = file.size

        this.removeAttribute('class')

        if(this.#autorizedFileTypes.length > 0) {
            if(this.#autorizedFileTypes.indexOf(fileType) === -1) {
                valid = false
                this.classList.add('is-invalid')
                this.textContent = 'Type de fichier non autorisé'
            }
        }

        if(this.#autorizedFileExtensions.length > 0) {
            if(this.#autorizedFileExtensions.indexOf(`.${fileExtension}`) === -1) {
                valid = false
                this.classList.add('is-invalid')
                this.textContent = 'Type de fichier non autorisé'
            }
        }

        if(this.#maxFileSize > 0) {
            if(fileSize > this.#maxFileSize) {
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