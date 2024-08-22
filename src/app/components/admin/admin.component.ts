import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { NgIf } from '@angular/common'
import { TabMenuModule } from 'primeng/tabmenu'
import { CardModule } from 'primeng/card'
import { MenuItem } from 'primeng/api'

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [RouterOutlet, NgIf, TabMenuModule, CardModule],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.scss'
})
export class AdminComponent {
    items: MenuItem[] = [
        {
            label: 'Anniversaires',
            routerLink: '/admin/anniversaires'
        },
        {
            label: 'Mutes',
            routerLink: '/admin/mutes'
        },
        {
            label: 'Bans',
            routerLink: '/admin/bans'
        },
        {
            label: "Messages d'anniversaire",
            routerLink: '/admin/messages-anniversaire'
        },
        {
            label: 'Chaînes Twitch',
            routerLink: '/admin/twitch'
        },
        {
            label: 'Demandes Cube-Stalker',
            routerLink: '/admin/cube-stalker'
        },
        {
            label: 'Logs Rankedle',
            routerLink: '/admin/logs-rankedle'
        }
    ]
}
