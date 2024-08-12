import { Component, Input } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NgIf, NgFor } from '@angular/common'
import { CardModule } from 'primeng/card'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { ButtonModule } from 'primeng/button'
import { CheckboxModule, CheckboxChangeEvent } from 'primeng/checkbox'
import { RadioButtonModule } from 'primeng/radiobutton'

import { ToastService } from '../../../services/toast/toast.service'
import { UserService, UserRole } from '../../../services/user/user.service'
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

    @Input() roles: UserRole[] = []
    @Input() selectedSingle: Record<string, string[]> = {}
    @Input() selectedMultiple: Record<string, string[]> = {}
    @Input() loading = true

    canSave = false
    saving = false

    singleRolesUpdated(event: CheckboxChangeEvent) {
        this.canSave = true
        console.log(event.checked, this.selectedSingle)
    }

    rolesUpdated() {
        this.canSave = true
    }

    save() {
        let selectedRoles = []
        for (const [, roleName] of Object.entries(this.selectedSingle))
            selectedRoles.push(roleName)
        for (const [, roles] of Object.entries(this.selectedMultiple))
            selectedRoles = [...selectedRoles, ...roles]

        console.log(this.selectedSingle, this.selectedMultiple)

        // this.saving = true
        // this.userService
        //     .setBirthday(this.birthDate)
        //     .pipe(
        //         catchError((error) => {
        //             this.saving = false
        //             throw error
        //         })
        //     )
        //     .subscribe(() => {
        //         this.saving = false
        //         this.canSave = false
        //         this.toastService.showSuccess(
        //             'Votre date de naissance a bien été enregistrée'
        //         )
        //     })
    }
}
