import { Component, EventEmitter, Input, Output } from '@angular/core'
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
export class ProfilRolesComponent {
    constructor(
        private toastService: ToastService,
        private userService: UserService
    ) {}

    @Input() roles: UserRoleCategory[] = []
    @Input() selected: Record<string, boolean> = {}
    @Input() loading = true
    @Input() canSave = false
    saving = false

    @Output() onChange = new EventEmitter<boolean>()

    rolesUpdated(
        event: CheckboxChangeEvent,
        categoryName: string,
        role: UserRole
    ) {
        this.onChange.emit(true)

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
                this.onChange.emit(false)
                this.toastService.showSuccess(
                    'Vos rôles ont bien été sauvegardés'
                )
            })
    }
}
