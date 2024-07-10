import { Injectable } from '@angular/core'
import { MessageService } from 'primeng/api'

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    config = {
        life: 3000,
        position: 'bottom-right'
    }

    constructor(private messageService: MessageService) {}

    showSuccess(message: string, title?: string) {
        this.messageService.clear()
        this.messageService.add({
            key: 'success',
            severity: 'success',
            summary: title || 'Succès',
            detail: message,
            life: this.config.life
        })
    }

    showInfo(message: string, title?: string) {
        this.messageService.clear()
        this.messageService.add({
            key: 'info',
            severity: 'info',
            summary: title || 'Information',
            detail: message,
            life: this.config.life
        })
    }

    showWarn(message: string, title?: string) {
        this.messageService.clear()
        this.messageService.add({
            key: 'warn',
            severity: 'warn',
            summary: title || 'Attention',
            detail: message,
            life: this.config.life
        })
    }

    showError(message: string, title?: string) {
        this.messageService.clear()
        this.messageService.add({
            key: 'error',
            severity: 'error',
            summary: title || 'Erreur',
            detail: message,
            life: this.config.life
        })
    }
}
