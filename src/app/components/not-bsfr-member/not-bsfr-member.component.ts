import { Component } from '@angular/core'
import { MessagesModule } from 'primeng/messages'
import { Message } from 'primeng/api'
import { environment } from '../../../environments/environment'

@Component({
    selector: 'app-not-bsfr-member',
    standalone: true,
    imports: [MessagesModule],
    templateUrl: './not-bsfr-member.component.html',
    styleUrl: './not-bsfr-member.component.scss'
})
export class NotBsfrMemberComponent {
    discordInvite = `https://discord.gg/${environment.production ? '8cAAa7J' : 'kZC2cwPBQV'}`
    notBSFRMessage: Message[] = [
        {
            closable: false,
            icon: 'pi pi-times-circle',
            severity: 'error',
            detail: `Vous devez être membre du serveur Discord BSFR afin de pouvoir consulter cette page.<br />\
                    Vous pouvez nous rejoindre en cliquant sur ce lien d\'invitation :\
                    <a href="${this.discordInvite}" target="_blank">${this.discordInvite}</a><br /><br />\
                    <i>Déconnectez-vous puis reconnectez-vous après avoir rejoint notre serveur Discord pour voir le contenu de cette page.</i>`
        }
    ]
}
