import { Component, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { CardModule } from 'primeng/card'
import { ButtonModule } from 'primeng/button'
import { InputTextModule } from 'primeng/inputtext'
import { InputGroupModule } from 'primeng/inputgroup'
import { InputGroupAddonModule } from 'primeng/inputgroupaddon'

import { Message } from 'primeng/message'

import { ToastService } from '../../../services/toast/toast.service'
import { UserService } from '../../../services/user/user.service'
import { catchError } from 'rxjs'

@Component({
    selector: 'app-profil-twitch',
    imports: [
        FormsModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        InputGroupModule,
        InputGroupAddonModule,
        Message
    ],
    templateUrl: './twitch.component.html',
    styleUrl: './twitch.component.scss'
})
export class ProfilTwitchComponent implements OnInit {
    constructor(
        private toastService: ToastService,
        private userService: UserService
    ) {}

    ngOnInit(): void {
        this.getTwitchChannel()
    }

    channelName = signal('')
    loading = signal(true)
    canSave = signal(false)
    saving = signal(false)

    getTwitchChannel() {
        this.channelName.set('')
        this.loading.set(true)
        this.canSave.set(false)
        this.userService.getTwitchChannel().subscribe((twitchChannel) => {
            this.channelName.set(twitchChannel?.name ?? '')
            this.loading.set(false)
        })
    }

    channelNameUpdated() {
        this.canSave.set(true)
    }

    save() {
        this.saving.set(true)
        this.userService
            .setTwitchChannel(this.channelName() || null)
            .pipe(
                catchError((error) => {
                    this.saving.set(false)
                    throw error
                })
            )
            .subscribe(() => {
                this.saving.set(false)
                this.canSave.set(false)
                this.toastService.showSuccess('Votre chaîne Twitch a bien été sauvegardée')
            })
    }
}
