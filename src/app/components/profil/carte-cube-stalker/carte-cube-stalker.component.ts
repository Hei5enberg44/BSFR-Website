import { Component, ViewChild, OnInit, signal } from '@angular/core'
import { NgIf, AsyncPipe } from '@angular/common'
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
import { ConfirmationService, ToastMessageOptions } from 'primeng/api'
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
    standalone: true,
    imports: [
        NgIf,
        AsyncPipe,
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
export class ProfilCarteCubeStalkerComponent implements OnInit {
    constructor(
        private userService: UserService,
        private confirmationService: ConfirmationService,
        private toastService: ToastService
    ) {}

    user$ = this.userService.user$

    ngOnInit(): void {
        this.user$.subscribe((user) => {
            if (user?.isNitroBooster || user?.isAdmin) {
                this.getCubeStalkerCard()
            }
        })
    }

    card: string | null = null
    status: MemberCardStatus | null = null
    loading = true
    canUpload = false
    canSave = false
    saving = false

    fileTypes = ['image/jpg', 'image/png', 'image/webp']
    file: UploadedFile | null = null
    uploadedFile: UploadedFile | null = null
    errorMessages = signal<ToastMessageOptions[]>([])

    @ViewChild('fileInput') fileInput!: FileUpload

    getCubeStalkerCard() {
        this.file = null
        this.uploadedFile = null
        this.loading = true
        this.userService.getCardPreview().subscribe((memberCard) => {
            this.card = memberCard.preview
            this.status = memberCard.status
            this.loading = false
            this.canUpload =
                this.status !== MemberCardStatus.Pending &&
                this.status !== MemberCardStatus.Approved
        })
    }

    choose(event: MouseEvent, callback: Function) {
        callback()
    }

    remove(callback: Function) {
        callback()
        this.getCubeStalkerCard()
        this.canSave = false
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

        this.file = event.files[0] as UploadedFile
        this.uploadedFile = null
        this.loading = true
        this.fileInput.upload()
    }

    onUpload(event: FileUploadEvent) {
        this.uploadedFile = event.files[0] as UploadedFile
        const response = (event.originalEvent as CardPreviewResponse).body
        if (response) this.card = response.preview
        this.loading = false
        this.canSave = true
    }

    onError(event: FileUploadErrorEvent) {
        this.fileInput.clear()
        this.showError(
            event.error?.error.message ??
                "Échec de l'envoie du fichier au serveur"
        )
        this.loading = false
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
        this.status = MemberCardStatus.Preview
        this.loading = true
        this.userService
            .removeCard()
            .pipe(
                catchError((error) => {
                    this.status = status
                    this.loading = false
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
        this.saving = true
        this.userService
            .setCard()
            .pipe(
                catchError((error) => {
                    this.saving = false
                    throw error
                })
            )
            .subscribe(() => {
                this.saving = false
                this.canSave = false
                this.getCubeStalkerCard()
                this.toastService.showSuccess(
                    'Votre image de carte Cube-Stalker a bien été sauvegardée'
                )
            })
    }
}
