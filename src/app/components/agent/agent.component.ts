import { Component } from '@angular/core'
import { RouterModule, RouterOutlet, Router } from '@angular/router'
import { TabsModule } from 'primeng/tabs'
import { CardModule } from 'primeng/card'

@Component({
    selector: 'app-agent',
    imports: [RouterModule, RouterOutlet, TabsModule, CardModule],
    templateUrl: './agent.component.html',
    styleUrl: './agent.component.scss'
})
export class AgentComponent {
    constructor(private router: Router) {
        this.activeRoute = router.url
    }

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

    activeRoute = this.tabs[0].route
}
