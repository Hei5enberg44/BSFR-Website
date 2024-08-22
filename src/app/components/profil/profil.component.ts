import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { NgIf } from '@angular/common'
import { TabMenuModule } from 'primeng/tabmenu'
import { CardModule } from 'primeng/card'
import { MenuItem } from 'primeng/api'

import { NotBsfrMemberComponent } from '../not-bsfr-member/not-bsfr-member.component'
import { UserService } from '../../services/user/user.service'

@Component({
    selector: 'app-profil',
    standalone: true,
    imports: [
        RouterOutlet,
        NgIf,
        TabMenuModule,
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

    items: MenuItem[] = [
        {
            label: 'Anniversaire',
            routerLink: '/profil/anniversaire'
        },
        {
            label: 'Rôles',
            routerLink: '/profil/roles'
        },
        {
            label: 'Ville',
            routerLink: '/profil/ville'
        },
        {
            label: 'Twitch',
            routerLink: '/profil/twitch'
        },
        {
            label: 'Image de carte Cube-Stalker',
            routerLink: '/profil/cube-stalker',
            icon: 'custom-icon discord-nitro'
        }
    ]
}
