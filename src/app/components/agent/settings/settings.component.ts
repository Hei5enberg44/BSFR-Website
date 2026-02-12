import { Component, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { CardModule } from 'primeng/card'
import { TableModule } from 'primeng/table'
import { ToggleSwitchModule, ToggleSwitchChangeEvent } from 'primeng/toggleswitch'

import { AgentService } from '../../../services/agent/agent.service'
import { ToastService } from '../../../services/toast/toast.service'

import { catchError, finalize } from 'rxjs'

@Component({
    selector: 'app-agent-settings',
    imports: [FormsModule, CardModule, TableModule, ToggleSwitchModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class AgentSettingsComponent implements OnInit {
    constructor(
        private agentService: AgentService,
        private toastService: ToastService
    ) {}

    // Messages privés
    privateMessages = signal(false)
    privateMessagesDisabled = signal(true)

    ngOnInit(): void {
        this.agentService.getSettings().subscribe((settings) => {
            for (const setting of settings) {
                if (setting.name === 'dm') {
                    this.privateMessages.set(setting.data.enabled)
                    this.privateMessagesDisabled.set(false)
                }
            }
        })
    }

    onSettingToggle(event: ToggleSwitchChangeEvent, name: string) {
        const checked = event.checked

        switch (name) {
            case 'dm':
                this.updatePrivateMessages(checked)
                break
        }
    }

    // Messages privés
    updatePrivateMessages(enabled: boolean) {
        this.privateMessagesDisabled.set(true)
        this.agentService
            .updateSetting('dm', { enabled })
            .pipe(
                catchError((error) => {
                    this.privateMessages.set(!enabled)
                    throw error
                }),
                finalize(() => {
                    this.privateMessagesDisabled.set(false)
                })
            )
            .subscribe(() => {
                this.toastService.showSuccess(
                    `Les messages privés sont maintenant ${enabled ? 'activés' : 'désactivés'}`
                )
            })
    }
}
