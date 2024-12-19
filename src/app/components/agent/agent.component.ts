import { Component } from '@angular/core'
import { RouterModule, RouterOutlet } from '@angular/router'
import { NgIf } from '@angular/common'
import { TabsModule } from 'primeng/tabs'
import { CardModule } from 'primeng/card'

@Component({
    selector: 'app-agent',
    standalone: true,
    imports: [RouterModule, RouterOutlet, NgIf, TabsModule, CardModule],
    templateUrl: './agent.component.html',
    styleUrl: './agent.component.scss'
})
export class AgentComponent {
    tabs = [
        {
            label: 'Envoyer un message',
            route: '/agent/message'
        },
        {
            label: 'Envoyer une réaction',
            route: '/agent/reaction'
        },
        {
            label: 'Paramètres',
            route: '/agent/parametres'
        }
    ]
}
