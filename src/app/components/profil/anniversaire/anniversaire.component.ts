import { Component, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { CardModule } from 'primeng/card'
import { ButtonModule } from 'primeng/button'
import { CalendarModule } from 'primeng/calendar'
import { Message } from 'primeng/message'
import { ToastMessageOptions } from 'primeng/api'

import { ToastService } from '../../../services/toast/toast.service'
import { DeviceDetectorService } from 'ngx-device-detector'
import { UserService } from '../../../services/user/user.service'
import { catchError } from 'rxjs'

@Component({
    selector: 'app-profil-anniversaire',
    imports: [CardModule, ButtonModule, FormsModule, CalendarModule, Message],
    templateUrl: './anniversaire.component.html',
    styleUrl: './anniversaire.component.scss'
})
export class ProfilAnniversaireComponent implements OnInit {
    constructor(
        private toastService: ToastService,
        private deviceService: DeviceDetectorService,
        private userService: UserService
    ) {}

    ngOnInit(): void {
        this.getBirthday()
    }

    birthDate!: Date | null
    loading = true
    canSave = false
    saving = false

    helpMessage: ToastMessageOptions = {
        icon: 'pi pi-info-circle',
        severity: 'info',
        text: "Indiquez votre date de naissance afin qu'<strong>@Agent</strong> vous souhaite votre anniversaire sur le serveur Discord."
    }

    private date = new Date()
    maxDate = new Date(this.date.setFullYear(this.date.getFullYear() - 13))
    defaultDate = new Date(2000, 0)

    get touchUI() {
        return this.deviceService.isMobile() || this.deviceService.isTablet()
    }

    getBirthday() {
        this.birthDate = null
        this.loading = true
        this.canSave = false
        this.userService.getBirthday().subscribe((res) => {
            this.birthDate = res.date
            this.loading = false
        })
    }

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
                    'Votre date de naissance a bien été sauvegardée'
                )
            })
    }
}
