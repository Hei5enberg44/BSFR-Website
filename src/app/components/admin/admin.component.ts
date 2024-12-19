import { Component } from '@angular/core'
import { RouterModule, RouterOutlet } from '@angular/router'
import { NgIf } from '@angular/common'
import { TabsModule } from 'primeng/tabs'
import { CardModule } from 'primeng/card'

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [RouterModule, RouterOutlet, NgIf, TabsModule, CardModule],
    templateUrl: './admin.component.html',
    styleUrl: './admin.component.scss'
})
export class AdminComponent {
    tabs = [
        {
            label: 'Anniversaires',
            route: '/admin/anniversaires'
        },
        {
            label: 'Mutes',
            route: '/admin/mutes'
        },
        {
            label: 'Bans',
            route: '/admin/bans'
        },
        {
            label: "Messages d'anniversaire",
            route: '/admin/messages-anniversaire'
        },
        {
            label: 'Chaînes Twitch',
            route: '/admin/twitch'
        },
        {
            label: 'Demandes Cube-Stalker',
            route: '/admin/cube-stalker'
        },
        {
            label: 'Logs Rankedle',
            route: '/admin/logs-rankedle'
        }
    ]
}
