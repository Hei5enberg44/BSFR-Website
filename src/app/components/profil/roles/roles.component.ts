import { Component, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NgIf, NgFor } from '@angular/common'
import { CardModule } from 'primeng/card'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { ButtonModule } from 'primeng/button'
import { CheckboxModule, CheckboxChangeEvent } from 'primeng/checkbox'
import { RadioButtonModule } from 'primeng/radiobutton'

import { ToastService } from '../../../services/toast/toast.service'
import {
    UserService,
    UserRoleCategory,
    UserRole
} from '../../../services/user/user.service'
import { catchError } from 'rxjs'

@Component({
    selector: 'app-profil-roles',
    standalone: true,
    imports: [
        FormsModule,
        NgIf,
        NgFor,
        CardModule,
        ProgressSpinnerModule,
        ButtonModule,
        CheckboxModule,
        RadioButtonModule
    ],
    templateUrl: './roles.component.html',
    styleUrl: './roles.component.scss'
})
export class ProfilRolesComponent implements OnInit {
    constructor(
        private toastService: ToastService,
        private userService: UserService
    ) {}

    ngOnInit(): void {
        this.getRoles()
    }

    roles: UserRoleCategory[] = []
    selected: Record<string, boolean> = {}
    loading = true
    canSave = false
    saving = false

    getRoles() {
        this.roles = []
        this.selected = {}
        this.loading = true
        this.canSave = false
        this.userService.getRoles().subscribe((res) => {
            this.roles = res
            for (const roleCategory of res) {
                for (const ss of roleCategory.roles) {
                    this.selected[ss.name] = ss.checked
                }
            }
            this.loading = false
        })
    }

    rolesUpdated(
        event: CheckboxChangeEvent,
        categoryName: string,
        role: UserRole
    ) {
        this.canSave = true

        if (event.checked && !role.multiple) {
            const roleCategory = this.roles.find(
                (rc) => rc.categoryName === categoryName
            )
            if (roleCategory) {
                for (const r of roleCategory.roles) {
                    if (!r.multiple && r.name !== role.name)
                        this.selected[r.name] = false
                }
            }
        }
    }

    save() {
        let selectedRoles = []
        for (const [roleName, checked] of Object.entries(this.selected))
            if (checked) selectedRoles.push(roleName)

        this.saving = true
        this.userService
            .setRoles(selectedRoles)
            .pipe(
                catchError((error) => {
                    this.saving = false
                    throw error
                })
            )
            .subscribe(() => {
                this.saving = false
                this.canSave = false
                this.toastService.showSuccess(
                    'Vos rôles ont bien été sauvegardés'
                )
            })
    }
}
