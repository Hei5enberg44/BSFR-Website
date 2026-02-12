import { Injectable } from '@angular/core'
import { MessageService } from 'primeng/api'

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    config = {
        life: 3000
    }

    constructor(private messageService: MessageService) {}

    private clearAll() {
        this.messageService.clear('success')
        this.messageService.clear('info')
        this.messageService.clear('warn')
        this.messageService.clear('error')
    }

    showSuccess(message: string, title?: string) {
        this.clearAll()
        this.messageService.add({
            key: 'success',
            severity: 'success',
            icon: 'pi pi-check-circle',
            summary: title || 'Succès',
            detail: message,
            life: this.config.life
        })
    }

    showInfo(message: string, title?: string) {
        this.clearAll()
        this.messageService.add({
            key: 'info',
            severity: 'info',
            icon: 'pi pi-info-circle',
            summary: title || 'Information',
            detail: message,
            life: this.config.life
        })
    }

    showWarn(message: string, title?: string) {
        this.clearAll()
        this.messageService.add({
            key: 'warn',
            severity: 'warn',
            icon: 'pi pi-exclamation-circle',
            summary: title || 'Attention',
            detail: message,
            life: this.config.life
        })
    }

    showError(message: string, title?: string) {
        this.clearAll()
        this.messageService.add({
            key: 'error',
            severity: 'error',
            icon: 'pi pi-times-circle',
            summary: title || 'Erreur',
            detail: message,
            life: this.config.life
        })
    }
}
