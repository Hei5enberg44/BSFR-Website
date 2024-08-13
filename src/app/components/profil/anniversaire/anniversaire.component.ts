import { Component, EventEmitter, Input, Output } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { CardModule } from 'primeng/card'
import { ButtonModule } from 'primeng/button'
import { CalendarModule } from 'primeng/calendar'
import { MessagesModule } from 'primeng/messages'
import { Message } from 'primeng/api'

import { ToastService } from '../../../services/toast/toast.service'
import { DeviceDetectorService } from 'ngx-device-detector'
import { UserService } from '../../../services/user/user.service'
import { catchError } from 'rxjs'

@Component({
    selector: 'app-profil-anniversaire',
    standalone: true,
    imports: [
        CardModule,
        ButtonModule,
        FormsModule,
        CalendarModule,
        MessagesModule
    ],
    templateUrl: './anniversaire.component.html',
    styleUrl: './anniversaire.component.scss'
})
export class ProfilAnniversaireComponent {
    constructor(
        private toastService: ToastService,
        private deviceService: DeviceDetectorService,
        private userService: UserService
    ) {}

    @Input() birthDate: Date | null = null
    @Input() loading = true
    @Input() canSave = false
    saving = false

    helpMessage: Message[] = [
        {
            closable: false,
            icon: 'pi pi-info-circle',
            severity: 'info',
            detail: "Indiquez votre date de naissance afin qu'<strong>@Agent</strong> vous souhaite votre anniversaire sur le serveur Discord."
        }
    ]

    private date = new Date()
    maxDate = new Date(this.date.setFullYear(this.date.getFullYear() - 13))
    defaultDate = new Date(2000, 0)

    get touchUI() {
        return this.deviceService.isMobile() || this.deviceService.isTablet()
    }

    @Output() onChange = new EventEmitter<boolean>()

    birthDateUpdated() {
        this.onChange.emit(true)
    }

    save() {
        this.saving = true
        this.userService
            .setBirthday(this.birthDate)
            .pipe(
                catchError((error) => {
                    this.saving = false
                    throw error
                })
            )
            .subscribe(() => {
                this.saving = false
                this.onChange.emit(false)
                this.toastService.showSuccess(
                    'Votre date de naissance a bien été sauvegardée'
                )
            })
    }
}
