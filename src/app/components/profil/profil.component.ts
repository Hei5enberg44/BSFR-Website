import { Component, OnInit } from '@angular/core'
import { NgIf } from '@angular/common'
import { CardModule } from 'primeng/card'
import { TabViewModule, TabViewChangeEvent } from 'primeng/tabview'

import { ProfilAnniversaireComponent } from './anniversaire/anniversaire.component'
import { ProfilRolesComponent } from './roles/roles.component'
import { ProfilVilleComponent } from './ville/ville.component'
import { ProfilTwitchComponent } from './twitch/twitch.component'

import { NotBsfrMemberComponent } from '../not-bsfr-member/not-bsfr-member.component'
import { UserService, UserRoleCategory, City } from '../../services/user/user.service'

@Component({
    selector: 'app-profil',
    standalone: true,
    imports: [
        NgIf,
        CardModule,
        TabViewModule,
        ProfilAnniversaireComponent,
        ProfilRolesComponent,
        ProfilVilleComponent,
        ProfilTwitchComponent,
        NotBsfrMemberComponent
    ],
    templateUrl: './profil.component.html',
    styleUrl: './profil.component.scss'
})
export class ProfilComponent implements OnInit {
    isBSFR: boolean = false

    constructor(private userService: UserService) {
        this.userService.user$.subscribe((user) => {
            this.isBSFR = user?.isBSFR ?? false
        })
    }

    ngOnInit(): void {
        this.getBirthday()
    }

    activeTab: number = 0

    onTabChange(event: TabViewChangeEvent) {
        switch (event.index) {
            case 0:
                this.getBirthday()
                break
            case 1:
                this.getRoles()
                break
            case 2:
                this.getCity()
                break
            case 3:
                this.getTwitchChannel()
                break
        }
    }

    // Anniversaire
    birthDate: Date | null = null
    birthdayLoading = true

    getBirthday() {
        this.birthDate = null
        this.birthdayLoading = true
        this.userService.getBirthday().subscribe((res) => {
            this.birthDate = res.date
            this.birthdayLoading = false
        })
    }

    // Rôles
    roles: UserRoleCategory[] = []
    rolesSelected: Record<string, boolean> = {}
    rolesLoading = true

    getRoles() {
        this.roles = []
        this.rolesSelected = {}
        this.rolesLoading = true
        this.userService.getRoles().subscribe((res) => {
            this.roles = res
            for (const roleCategory of res) {
                for (const ss of roleCategory.roles) {
                    this.rolesSelected[ss.name] = ss.checked
                }
            }
            this.rolesLoading = false
        })
    }

    // Ville
    city: City | null = null
    cityLoading = true

    getCity() {
        this.city = null
        this.cityLoading = true
        this.userService.getCity().subscribe((city) => {
            this.city = city
            this.cityLoading = false
        })
    }

    // Twitch
    channelName: string | null = null
    twitchLoading = true

    getTwitchChannel() {
        this.channelName = null
        this.twitchLoading = true
        this.userService.getTwitchChannel().subscribe((twitchChannel) => {
            this.channelName = twitchChannel?.name || null
            this.twitchLoading = false
        })
    }
}
