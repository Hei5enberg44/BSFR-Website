import { Component, OnInit } from '@angular/core'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { FormsModule } from '@angular/forms'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { ButtonModule } from 'primeng/button'

import { BirthdayMessage } from '../../../../services/admin/admin.service'
import { ToastService } from '../../../../services/toast/toast.service'

type Action = 'add' | 'modify'

@Component({
    selector: 'app-edit-dialog',
    standalone: true,
    imports: [FormsModule, InputTextareaModule, ButtonModule],
    templateUrl: './edit-dialog.component.html',
    styleUrl: './edit-dialog.component.scss'
})
export class EditDialogComponent implements OnInit {
    constructor(
        private dynamicDialogConfig: DynamicDialogConfig,
        private ref: DynamicDialogRef,
        private toastService: ToastService
    ) {}

    action!: Action
    message: string = ''
    canSave = false

    ngOnInit(): void {
        const data = this.dynamicDialogConfig.data
        this.action = data.action as Action
        if (this.action === 'modify') {
            this.message = (data.birthdayMessage as BirthdayMessage).message
        }
    }

    onChange() {
        this.canSave = true
    }

    saveMessage() {
        if (this.message === '')
            this.toastService.showError(
                "Le message d'anniversaire ne peut pas être vide"
            )
        else this.ref.close(this.message)
    }

    closeDialog() {
        this.ref.close()
    }
}
