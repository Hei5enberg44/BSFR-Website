import { Component } from '@angular/core'
import { RouterModule, RouterOutlet, Router } from '@angular/router'
import { TabsModule } from 'primeng/tabs'
import { CardModule } from 'primeng/card'

import { UserService } from '../../services/user/user.service'

@Component({
    selector: 'app-profil',
    imports: [RouterModule, RouterOutlet, TabsModule, CardModule],
    templateUrl: './profil.component.html',
    styleUrl: './profil.component.scss'
})
export class ProfilComponent {
    isBSFR: boolean = false

    constructor(
        private userService: UserService,
        private router: Router
    ) {
        this.isBSFR = this.userService.user()?.isBSFR ?? false
        this.activeRoute = router.url
    }

    tabs = [
        {
            label: 'Anniversaire',
            route: '/profil/anniversaire'
        },
        {
            label: 'Rôles',
            route: '/profil/roles'
        },
        {
            label: 'Ville',
            route: '/profil/ville'
        },
        {
            label: 'Twitch',
            route: '/profil/twitch'
        },
        {
            label: 'Image de carte Cube-Stalker',
            route: '/profil/cube-stalker',
            icon: 'custom-icon discord-nitro'
        }
    ]

    activeRoute = this.tabs[0].route
}
