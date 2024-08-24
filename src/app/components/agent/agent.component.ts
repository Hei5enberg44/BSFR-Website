import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { NgIf } from '@angular/common'
import { TabMenuModule } from 'primeng/tabmenu'
import { CardModule } from 'primeng/card'
import { MenuItem } from 'primeng/api'

@Component({
    selector: 'app-agent',
    standalone: true,
    imports: [RouterOutlet, NgIf, TabMenuModule, CardModule],
    templateUrl: './agent.component.html',
    styleUrl: './agent.component.scss'
})
export class AgentComponent {
    items: MenuItem[] = [
        {
            label: 'Envoyer un message',
            routerLink: '/agent/message'
        },
        {
            label: 'Envoyer une réaction',
            routerLink: '/agent/reaction'
        },
        {
            label: 'Paramètres',
            routerLink: '/agent/parametres'
        }
    ]
}
