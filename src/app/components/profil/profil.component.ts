import { Component } from '@angular/core'
import { RouterModule, RouterOutlet } from '@angular/router'
import { NgIf } from '@angular/common'
import { TabsModule } from 'primeng/tabs'
import { CardModule } from 'primeng/card'

import { NotBsfrMemberComponent } from '../not-bsfr-member/not-bsfr-member.component'
import { UserService } from '../../services/user/user.service'

@Component({
    selector: 'app-profil',
    standalone: true,
    imports: [
        RouterModule,
        RouterOutlet,
        NgIf,
        TabsModule,
        CardModule,
        NotBsfrMemberComponent
    ],
    templateUrl: './profil.component.html',
    styleUrl: './profil.component.scss'
})
export class ProfilComponent {
    isBSFR: boolean = false

    constructor(private userService: UserService) {
        this.userService.user$.subscribe((user) => {
            this.isBSFR = user?.isBSFR ?? false
        })
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
}
