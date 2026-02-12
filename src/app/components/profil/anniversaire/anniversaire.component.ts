import { Component, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { CardModule } from 'primeng/card'
import { ButtonModule } from 'primeng/button'
import { DatePickerModule } from 'primeng/datepicker'
import { Message } from 'primeng/message'

import { ToastService } from '../../../services/toast/toast.service'
import { DeviceDetectorService } from 'ngx-device-detector'
import { UserService } from '../../../services/user/user.service'
import { catchError } from 'rxjs'

@Component({
    selector: 'app-profil-anniversaire',
    imports: [CardModule, ButtonModule, FormsModule, DatePickerModule, Message],
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

    birthDate = signal<Date | null>(null)
    loading = signal(true)
    canSave = signal(false)
    saving = signal(false)

    private date = new Date()
    maxDate = new Date(this.date.setFullYear(this.date.getFullYear() - 13))
    defaultDate = new Date(2000, 0)

    get touchUI() {
        return this.deviceService.isMobile() || this.deviceService.isTablet()
    }

    getBirthday() {
        this.birthDate.set(null)
        this.loading.set(true)
        this.canSave.set(false)
        this.userService.getBirthday().subscribe((res) => {
            this.birthDate.set(res.date)
            this.loading.set(false)
        })
    }

    birthDateUpdated() {
        this.canSave.set(true)
    }

    save() {
        this.saving.set(true)
        this.userService
            .setBirthday(this.birthDate())
            .pipe(
                catchError((error) => {
                    this.saving.set(false)
                    throw error
                })
            )
            .subscribe(() => {
                this.saving.set(false)
                this.canSave.set(false)
                this.toastService.showSuccess('Votre date de naissance a bien été sauvegardée')
            })
    }
}
