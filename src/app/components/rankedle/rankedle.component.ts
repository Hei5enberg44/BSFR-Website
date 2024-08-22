import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { TabMenuModule } from 'primeng/tabmenu'
import { CardModule } from 'primeng/card'

import { NotBsfrMemberComponent } from '../not-bsfr-member/not-bsfr-member.component'
import { UserService } from '../../services/user/user.service'

@Component({
    selector: 'app-rankedle',
    standalone: true,
    imports: [RouterOutlet, TabMenuModule, CardModule, NotBsfrMemberComponent],
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

    items = [
        {
            label: 'Jeu',
            routerLink: 'jeu',
            icon: 'pi pi-play'
        },
        {
            label: 'Classement',
            routerLink: 'classement',
            icon: 'pi pi-chart-bar'
        },
        {
            label: 'Statistiques',
            routerLink: 'statistiques',
            icon: 'pi pi-chart-pie'
        },
        {
            label: 'Historique',
            routerLink: 'historique',
            icon: 'pi pi-history'
        },
        {
            label: 'Aide',
            routerLink: 'aide',
            icon: 'pi pi-question-circle'
        }
    ]
}
