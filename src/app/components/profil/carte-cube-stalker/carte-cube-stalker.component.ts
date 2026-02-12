import { Component, ViewChild, signal, computed, inject } from '@angular/core'
import { CardModule } from 'primeng/card'
import { ButtonModule } from 'primeng/button'
import { Message } from 'primeng/message'
import { SkeletonModule } from 'primeng/skeleton'
import {
    FileSelectEvent,
    FileUpload,
    FileUploadErrorEvent,
    FileUploadEvent,
    FileUploadModule
} from 'primeng/fileupload'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { ConfirmationService } from 'primeng/api'
import {
    CardPreviewResponse,
    MemberCardStatus,
    UploadedFile,
    UserService
} from '../../../services/user/user.service'
import { ToastService } from '../../../services/toast/toast.service'
import { catchError } from 'rxjs'

@Component({
    selector: 'app-profil-carte-cube-stalker',
    imports: [
        CardModule,
        ButtonModule,
        Message,
        SkeletonModule,
        FileUploadModule,
        ConfirmDialogModule
    ],
    templateUrl: './carte-cube-stalker.component.html',
    styleUrl: './carte-cube-stalker.component.scss'
})
export class ProfilCarteCubeStalkerComponent {
    userService = inject(UserService)
    confirmationService = inject(ConfirmationService)
    toastService = inject(ToastService)

    user = this.userService.user

    card = signal<string | null>(null)
    status = signal<MemberCardStatus | null>(null)
    loading = signal(true)
    canUpload = signal(false)
    canSave = signal(false)
    saving = signal(false)

    fileTypes = ['image/jpg', 'image/png', 'image/webp']
    file = signal<UploadedFile | null>(null)
    uploadedFile = signal<UploadedFile | null>(null)
    errorMessages = signal<any[]>([])

    @ViewChild('fileInput') fileInput!: FileUpload

    ngOnInit(): void {
        if (this.user()?.isNitroBooster || this.user()?.isAdmin) {
            this.getCubeStalkerCard()
        }
    }

    getCubeStalkerCard() {
        this.file.set(null)
        this.uploadedFile.set(null)
        this.loading.set(true)
        this.userService.getCardPreview().subscribe((memberCard) => {
            this.card.set(memberCard.preview)
            this.status.set(memberCard.status)
            this.loading.set(false)
            this.canUpload.set(
                this.status() !== MemberCardStatus.Pending &&
                    this.status() !== MemberCardStatus.Approved
            )
        })
    }

    choose(event: MouseEvent, callback: Function) {
        callback()
    }

    remove(callback: Function) {
        callback()
        this.getCubeStalkerCard()
        this.canSave.set(false)
    }

    onSelect(event: FileSelectEvent) {
        this.errorMessages.set([])

        if (this.fileInput.msgs) {
            const msgs = this.fileInput.msgs
            if (msgs.length > 0) {
                this.showError(msgs[0].detail as string)
                this.fileInput.msgs = []
                return
            }
        }

        this.file.set(event.files[0] as UploadedFile)
        this.uploadedFile.set(null)
        this.loading.set(true)
        this.fileInput.upload()
    }

    onUpload(event: FileUploadEvent) {
        this.uploadedFile.set(event.files[0] as UploadedFile)
        const response = (event.originalEvent as CardPreviewResponse).body
        if (response) this.card.set(response.preview)
        this.loading.set(false)
        this.canSave.set(true)
    }

    onError(event: FileUploadErrorEvent) {
        this.fileInput.clear()
        this.showError(event.error?.error.message ?? "Échec de l'envoie du fichier au serveur")
        this.loading.set(false)
    }

    showError(error: string) {
        this.errorMessages.update((m) => {
            const nm = {
                severity: 'error',
                icon: 'pi pi-times-circle',
                text: error
            }
            return [...m, nm]
        })
    }

    cancelConfirm(event: MouseEvent) {
        event.preventDefault()
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            key: 'card-confirm-dialog',
            header: "Annuler la demande d'approbation",
            message: 'Voulez-vous continuer ?',
            icon: 'pi pi-info-circle',
            acceptButtonStyleClass: 'p-button-danger p-button-text',
            rejectButtonStyleClass: 'p-button-text',
            acceptIcon: 'none',
            rejectIcon: 'none',
            accept: () => {
                this.removeCubeStalkerCard()
            }
        })
    }

    removeConfirm(event: Event) {
        event.preventDefault()
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            key: 'card-confirm-dialog',
            header: 'Revenir à la carte par défaut',
            message: 'Voulez-vous continuer ?',
            icon: 'pi pi-info-circle',
            acceptButtonStyleClass: 'p-button-danger p-button-text',
            rejectButtonStyleClass: 'p-button-text',
            acceptIcon: 'none',
            rejectIcon: 'none',
            accept: () => {
                this.removeCubeStalkerCard()
            }
        })
    }

    removeCubeStalkerCard() {
        const status = this.status
        this.status.set(MemberCardStatus.Preview)
        this.loading.set(true)
        this.userService
            .removeCard()
            .pipe(
                catchError((error) => {
                    this.status = status
                    this.loading.set(false)
                    throw error
                })
            )
            .subscribe(() => {
                this.getCubeStalkerCard()
                this.toastService.showSuccess(
                    'Votre image de carte Cube-Stalker à bien été supprimée'
                )
            })
    }

    save() {
        this.saving.set(true)
        this.userService
            .setCard()
            .pipe(
                catchError((error) => {
                    this.saving.set(false)
                    throw error
                })
            )
            .subscribe(() => {
                this.saving.set(false)
                this.canSave.set(false)
                this.getCubeStalkerCard()
                this.toastService.showSuccess(
                    'Votre image de carte Cube-Stalker a bien été sauvegardée'
                )
            })
    }
}
