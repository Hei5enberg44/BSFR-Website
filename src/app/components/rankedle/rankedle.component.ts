import { Component } from '@angular/core'
import { RouterModule, RouterOutlet } from '@angular/router'
import { TabsModule } from 'primeng/tabs'
import { CardModule } from 'primeng/card'

import { NotBsfrMemberComponent } from '../not-bsfr-member/not-bsfr-member.component'
import { UserService } from '../../services/user/user.service'

@Component({
    selector: 'app-rankedle',
    standalone: true,
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

    constructor(private userService: UserService) {
        this.userService.user$.subscribe((user) => {
            this.isBSFR = user?.isBSFR ?? false
        })
    }

    tabs = [
        {
            label: 'Jeu',
            route: 'jeu',
            icon: 'pi pi-play'
        },
        {
            label: 'Classement',
            route: 'classement',
            icon: 'pi pi-chart-bar'
        },
        {
            label: 'Statistiques',
            route: 'statistiques',
            icon: 'pi pi-chart-pie'
        },
        {
            label: 'Historique',
            route: 'historique',
            icon: 'pi pi-history'
        },
        {
            label: 'Aide',
            route: 'aide',
            icon: 'pi pi-question-circle'
        }
    ]
}
