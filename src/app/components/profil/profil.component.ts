import { Component, OnInit } from '@angular/core'
import { NgIf } from '@angular/common'
import { CardModule } from 'primeng/card'
import { TabViewModule, TabViewChangeEvent } from 'primeng/tabview'

import { ProfilAnniversaireComponent } from './anniversaire/anniversaire.component'
import { ProfilRolesComponent } from './roles/roles.component'
import { ProfilVilleComponent } from './ville/ville.component'

import { NotBsfrMemberComponent } from '../not-bsfr-member/not-bsfr-member.component'
import { UserService, UserRole, City } from '../../services/user/user.service'

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
    roles: UserRole[] = []
    rolesSelectedSingle: Record<string, string[]> = {}
    rolesSelectedMultiple: Record<string, string[]> = {}
    rolesLoading = true

    getRoles() {
        this.roles = []
        this.rolesSelectedSingle = {}
        this.rolesSelectedMultiple = {}
        this.rolesLoading = true
        this.userService.getRoles().subscribe((res) => {
            this.roles = res
            for (const roleCategory of res) {
                const selectedSingle = roleCategory.roles.filter(
                    (r) => r.checked && !r.multiple
                )
                if (selectedSingle.length > 0)
                    this.rolesSelectedSingle[roleCategory.categoryName] =
                        selectedSingle.map((s) => s.name)
                const selectedMultiple = roleCategory.roles.filter(
                    (r) => r.checked && r.multiple
                )
                if (selectedMultiple.length > 0)
                    this.rolesSelectedMultiple[roleCategory.categoryName] =
                        selectedMultiple.map((s) => s.name)
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
}
