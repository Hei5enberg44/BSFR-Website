import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog'
import { FormsModule } from '@angular/forms'
import { InputGroupModule } from 'primeng/inputgroup'
import { InputGroupAddonModule } from 'primeng/inputgroupaddon'
import { TextareaModule } from 'primeng/textarea'
import { ButtonModule } from 'primeng/button'
import { EmEmojiPickerComponent, Emoji } from '../../../em-emoji-picker/em-emoji-picker.component'

import { BirthdayMessage } from '../../../../services/admin/admin.service'
import { ToastService } from '../../../../services/toast/toast.service'

type Action = 'add' | 'modify'

@Component({
    selector: 'app-edit-dialog',
    imports: [
        FormsModule,
        InputGroupModule,
        InputGroupAddonModule,
        TextareaModule,
        ButtonModule,
        EmEmojiPickerComponent
    ],
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

    @ViewChild('ta') textarea!: ElementRef<HTMLTextAreaElement>
    selectionStart = 0
    selectionEnd = 0

    ngOnInit(): void {
        const data = this.dynamicDialogConfig.data
        this.action = data.action as Action
        if (this.action === 'modify') {
            this.message = (data.birthdayMessage as BirthdayMessage).message
        }
    }

    onSelectionChange(event: Event) {
        this.selectionStart = (event.target as HTMLTextAreaElement).selectionStart
        this.selectionEnd = (event.target as HTMLTextAreaElement).selectionEnd
    }

    onChange(event: Event) {
        this.canSave = true
    }

    onEmoji(event: { emoji: Emoji; event: PointerEvent }) {
        const emoji = event.emoji
        let content = ''
        if (emoji.native) {
            content = `${emoji.native} `
        } else if (emoji.keywords && emoji.keywords[0]) {
            const identifier = emoji.keywords[0]
            content = `${identifier} `
        }
        this.message =
            this.message.substring(0, this.selectionStart) +
            content +
            this.message.substring(this.selectionEnd)
        const textarea = this.textarea.nativeElement
        const selectionStart = textarea.selectionStart + content.length
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(selectionStart, selectionStart)
        }, 100)
        this.canSave = true
    }

    saveMessage() {
        if (this.message === '')
            this.toastService.showError("Le message d'anniversaire ne peut pas être vide")
        else this.ref.close(this.message)
    }

    closeDialog() {
        this.ref.close()
    }
}
