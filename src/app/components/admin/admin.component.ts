import { Component } from '@angular/core'
import { RouterModule, RouterOutlet, Router } from '@angular/router'
import { TabsModule } from 'primeng/tabs'
import { CardModule } from 'primeng/card'

@Component({
    selector: 'app-admin',
    imports: [RouterModule, RouterOutlet, TabsModule, CardModule],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.scss'
})
export class AdminComponent {
    constructor(private router: Router) {
        this.activeRoute = router.url
    }

    tabs = [
        {
            label: 'Anniversaires',
            route: '/admin/anniversaires'
        },
        {
            label: 'Mutes',
            route: '/admin/mutes'
        },
        {
            label: 'Bans',
            route: '/admin/bans'
        },
        {
            label: "Messages d'anniversaire",
            route: '/admin/messages-anniversaire'
        },
        {
            label: 'Chaînes Twitch',
            route: '/admin/twitch'
        },
        {
            label: 'Demandes Cube-Stalker',
            route: '/admin/cube-stalker'
        }
    ]

    activeRoute = this.tabs[0].route
}
