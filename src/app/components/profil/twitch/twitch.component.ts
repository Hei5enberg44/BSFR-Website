import { Component, EventEmitter, Input, Output } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NgIf, NgFor } from '@angular/common'
import { CardModule } from 'primeng/card'
import { ButtonModule } from 'primeng/button'
import { InputTextModule } from 'primeng/inputtext'
import { InputGroupModule } from 'primeng/inputgroup'
import { InputGroupAddonModule } from 'primeng/inputgroupaddon'

import { MessagesModule } from 'primeng/messages'
import { Message } from 'primeng/api'

import { ToastService } from '../../../services/toast/toast.service'
import { UserService } from '../../../services/user/user.service'
import { catchError } from 'rxjs'

@Component({
    selector: 'app-profil-twitch',
    standalone: true,
    imports: [
        FormsModule,
        NgIf,
        NgFor,
        CardModule,
        ButtonModule,
        InputTextModule,
        InputGroupModule,
        InputGroupAddonModule,
        MessagesModule
    ],
    templateUrl: './twitch.component.html',
    styleUrl: './twitch.component.scss'
})
export class ProfilTwitchComponent {
    constructor(
        private toastService: ToastService,
        private userService: UserService
    ) {}

    @Input() channelName: string | null = null
    @Input() loading = true
    @Input() canSave = false
    saving = false

    helpMessage: Message[] = [
        {
            closable: false,
            icon: 'pi pi-info-circle',
            severity: 'info',
            detail: "Indiquer le nom votre chaîne Twitch afin qu'une notification soit envoyée sur le serveur pour prévenir que vous êtes en live."
        }
    ]

    @Output() onChange = new EventEmitter<boolean>()

    channelNameUpdated() {
        this.onChange.emit(true)
    }

    save() {
        this.saving = true
        this.userService
            .setTwitchChannel(this.channelName || null)
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
                    'Votre chaîne Twitch a bien été sauvegardée'
                )
            })
    }
}
