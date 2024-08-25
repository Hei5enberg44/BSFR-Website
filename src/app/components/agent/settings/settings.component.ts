import { Component, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { CardModule } from 'primeng/card'
import { TableModule } from 'primeng/table'
import { InputSwitchModule, InputSwitchChangeEvent } from 'primeng/inputswitch'

import { AgentService } from '../../../services/agent/agent.service'
import { ToastService } from '../../../services/toast/toast.service'

import { catchError, finalize } from 'rxjs'

@Component({
    selector: 'app-agent-settings',
    standalone: true,
    imports: [FormsModule, CardModule, TableModule, InputSwitchModule],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss'
})
export class AgentSettingsComponent implements OnInit {
    constructor(
        private agentService: AgentService,
        private toastService: ToastService
    ) {}

    // Messages privés
    privateMessages = false
    privateMessagesDisabled = true

    ngOnInit(): void {
        this.agentService.getSettings().subscribe((settings) => {
            for (const setting of settings) {
                if (setting.name === 'dm') {
                    this.privateMessages = setting.data.enabled
                    this.privateMessagesDisabled = false
                }
            }
        })
    }

    onSettingToggle(event: InputSwitchChangeEvent, name: string) {
        const checked = event.checked

        switch (name) {
            case 'dm':
                this.updatePrivateMessages(checked)
                break
        }
    }

    // Messages privés
    updatePrivateMessages(enabled: boolean) {
        this.privateMessagesDisabled = true
        this.agentService
            .updateSetting('dm', { enabled })
            .pipe(
                catchError((error) => {
                    this.privateMessages = !enabled
                    throw error
                }),
                finalize(() => {
                    this.privateMessagesDisabled = false
                })
            )
            .subscribe(() => {
                this.toastService.showSuccess(
                    `Les messages privés sont maintenant ${enabled ? 'activés' : 'désactivés'}`
                )
            })
    }
}
