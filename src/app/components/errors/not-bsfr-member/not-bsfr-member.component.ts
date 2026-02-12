import { Component } from '@angular/core'
import { CardModule } from 'primeng/card'
import { environment } from '../../../../environments/environment'

@Component({
    selector: 'app-not-bsfr-member',
    imports: [CardModule],
    templateUrl: './not-bsfr-member.component.html',
    styleUrl: './not-bsfr-member.component.scss'
})
export class NotBsfrMemberComponent {
    discordInvite = `https://discord.gg/${environment.production ? '8cAAa7J' : 'kZC2cwPBQV'}`
}
