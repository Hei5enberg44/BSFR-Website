import { Component } from '@angular/core'
import { NgIf } from '@angular/common'
import { CardModule } from 'primeng/card'
import { MessagesModule } from 'primeng/messages'

@Component({
    selector: 'app-profil',
    standalone: true,
    imports: [NgIf, CardModule, MessagesModule],
    templateUrl: './profil.component.html',
    styleUrl: './profil.component.scss'
})
export class ProfilComponent {}
