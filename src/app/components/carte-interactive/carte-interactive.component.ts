import { Component } from '@angular/core'
import { NgIf } from '@angular/common'
import { CardModule } from 'primeng/card'
import { NotBsfrMemberComponent } from '../not-bsfr-member/not-bsfr-member.component'
import { UserService } from '../../services/user/user.service'

@Component({
    selector: 'app-carteinteractive',
    standalone: true,
    imports: [NgIf, CardModule, NotBsfrMemberComponent],
    templateUrl: './carte-interactive.component.html',
    styleUrl: './carte-interactive.component.scss'
})
export class CarteInteractiveComponent {
    isBSFR: boolean = false

    constructor(private userService: UserService) {
        this.userService.user$.subscribe((user) => {
            this.isBSFR = user?.params.isBSFR ?? false
        })
    }
}
