import { Component, OnInit } from '@angular/core'
import { NgIf } from '@angular/common'
import { CardModule } from 'primeng/card'
import { TabViewModule, TabViewChangeEvent } from 'primeng/tabview'

import { ProfilAnniversaireComponent } from './anniversaire/anniversaire.component'
import { ProfilRolesComponent } from './roles/roles.component'
import { ProfilVilleComponent } from './ville/ville.component'
import { ProfilTwitchComponent } from './twitch/twitch.component'

import { NotBsfrMemberComponent } from '../not-bsfr-member/not-bsfr-member.component'
import {
    UserService,
    UserRoleCategory,
    City
} from '../../services/user/user.service'

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
    birthdayCanSave = false

    getBirthday() {
        this.birthDate = null
        this.birthdayLoading = true
        this.birthdayCanSave = false
        this.userService.getBirthday().subscribe((res) => {
            this.birthDate = res.date
            this.birthdayLoading = false
        })
    }

    birthDateUpdated(canSave: boolean) {
        this.birthdayCanSave = canSave
    }

    // Rôles
    roles: UserRoleCategory[] = []
    rolesSelected: Record<string, boolean> = {}
    rolesLoading = true
    rolesCanSave = false

    getRoles() {
        this.roles = []
        this.rolesSelected = {}
        this.rolesLoading = true
        this.rolesCanSave = false
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

    rolesUpdated(canSave: boolean) {
        this.rolesCanSave = canSave
    }

    // Ville
    city: City | null = null
    cityLoading = true
    cityCanSave = false

    getCity() {
        this.city = null
        this.cityLoading = true
        this.cityCanSave = false
        this.userService.getCity().subscribe((city) => {
            this.city = city
            this.cityLoading = false
        })
    }

    cityUpdated(canSave: boolean) {
        this.cityCanSave = canSave
    }

    // Twitch
    channelName: string | null = null
    twitchLoading = true
    twitchCanSave = false

    getTwitchChannel() {
        this.channelName = null
        this.twitchLoading = true
        this.twitchCanSave = false
        this.userService.getTwitchChannel().subscribe((twitchChannel) => {
            this.channelName = twitchChannel?.name || null
            this.twitchLoading = false
        })
    }

    channelNameUpdated(canSave: boolean) {
        this.twitchCanSave = canSave
    }
}
