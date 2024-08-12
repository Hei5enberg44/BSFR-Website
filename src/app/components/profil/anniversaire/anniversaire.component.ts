import { Component, Input } from '@angular/core'
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

    helpMessage: Message[] = [
        {
            closable: false,
            icon: 'pi pi-info-circle',
            severity: 'info',
            detail: "Indiquez votre date de naissance afin qu'<strong>@Agent</strong> vous souhaite votre anniversaire sur le serveur Discord."
        }
    ]

    @Input() birthDate: Date | null = null
    private date = new Date()
    maxDate = new Date(this.date.setFullYear(this.date.getFullYear() - 13))
    defaultDate = new Date(2000, 0)

    get touchUI() {
        return this.deviceService.isMobile() || this.deviceService.isTablet()
    }

    @Input() loading = true
    canSave = false
    saving = false

    birthDateUpdated() {
        this.canSave = true
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
                this.canSave = false
                this.toastService.showSuccess(
                    'Votre date de naissance a bien été enregistrée'
                )
            })
    }
}
