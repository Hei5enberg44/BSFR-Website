import { Component, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { CardModule } from 'primeng/card'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { ButtonModule } from 'primeng/button'
import { CheckboxModule, CheckboxChangeEvent } from 'primeng/checkbox'
import { RadioButtonModule } from 'primeng/radiobutton'

import { ToastService } from '../../../services/toast/toast.service'
import { UserService, UserRoleCategory, UserRole } from '../../../services/user/user.service'
import { catchError } from 'rxjs'

@Component({
    selector: 'app-profil-roles',
    imports: [
        FormsModule,
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

    roles = signal<UserRoleCategory[]>([])
    selected: Record<string, boolean> = {}
    loading = signal(true)
    canSave = signal(false)
    saving = signal(false)

    getRoles() {
        this.roles.set([])
        this.selected = {}
        this.loading.set(true)
        this.canSave.set(false)
        this.userService.getRoles().subscribe((res) => {
            this.roles.set(res)
            for (const roleCategory of res) {
                for (const ss of roleCategory.roles) {
                    this.selected[ss.name] = ss.checked
                }
            }
            this.loading.set(false)
        })
    }

    rolesUpdated(event: CheckboxChangeEvent, categoryName: string, role: UserRole) {
        this.canSave.set(true)

        if (event.checked && !role.multiple) {
            const roleCategory = this.roles().find((rc) => rc.categoryName === categoryName)
            if (roleCategory) {
                for (const r of roleCategory.roles) {
                    if (!r.multiple && r.name !== role.name) this.selected[r.name] = false
                }
            }
        }
    }

    save() {
        let selectedRoles = []
        for (const [roleName, checked] of Object.entries(this.selected))
            if (checked) selectedRoles.push(roleName)

        this.saving.set(true)
        this.userService
            .setRoles(selectedRoles)
            .pipe(
                catchError((error) => {
                    this.saving.set(false)
                    throw error
                })
            )
            .subscribe(() => {
                this.saving.set(false)
                this.canSave.set(false)
                this.toastService.showSuccess('Vos rôles ont bien été sauvegardés')
            })
    }
}
