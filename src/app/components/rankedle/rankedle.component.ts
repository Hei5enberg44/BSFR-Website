import { Component } from '@angular/core'
import { RouterModule, RouterOutlet, Router } from '@angular/router'
import { TabsModule } from 'primeng/tabs'
import { CardModule } from 'primeng/card'

import { NotBsfrMemberComponent } from '../not-bsfr-member/not-bsfr-member.component'
import { UserService } from '../../services/user/user.service'

@Component({
    selector: 'app-rankedle',
    imports: [
        RouterModule,
        RouterOutlet,
        TabsModule,
        CardModule,
        NotBsfrMemberComponent
    ],
    templateUrl: './rankedle.component.html',
    styleUrl: './rankedle.component.scss'
})
export class RankedleComponent {
    isBSFR: boolean = false

    constructor(private userService: UserService, private router: Router) {
        this.userService.user$.subscribe((user) => {
            this.isBSFR = user?.isBSFR ?? false
        })
        this.activeRoute = router.url
    }

    tabs = [
        {
            label: 'Jeu',
            route: '/rankedle/jeu',
            icon: 'pi pi-play'
        },
        {
            label: 'Classement',
            route: '/rankedle/classement',
            icon: 'pi pi-chart-bar'
        },
        {
            label: 'Statistiques',
            route: '/rankedle/statistiques',
            icon: 'pi pi-chart-pie'
        },
        {
            label: 'Historique',
            route: '/rankedle/historique',
            icon: 'pi pi-history'
        },
        {
            label: 'Aide',
            route: '/rankedle/aide',
            icon: 'pi pi-question-circle'
        }
    ]

    activeRoute = this.tabs[0].route
}
