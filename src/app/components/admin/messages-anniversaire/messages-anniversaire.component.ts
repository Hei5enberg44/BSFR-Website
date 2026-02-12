import { Component, signal } from '@angular/core'
import { SkeletonModule } from 'primeng/skeleton'
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table'
import { AvatarModule } from 'primeng/avatar'
import { ButtonModule } from 'primeng/button'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog'
import { ConfirmationService, FilterMetadata } from 'primeng/api'

import { EditDialogComponent } from './edit-dialog/edit-dialog.component'

import { AdminService, BirthdayMessage } from '../../../services/admin/admin.service'
import { ToastService } from '../../../services/toast/toast.service'
import { catchError, finalize, map } from 'rxjs'

@Component({
    selector: 'app-admin-messages-anniversaire',
    imports: [SkeletonModule, TableModule, AvatarModule, ButtonModule, ConfirmDialogModule],
    providers: [DialogService],
    templateUrl: './messages-anniversaire.component.html',
    styleUrl: './messages-anniversaire.component.scss'
})
export class AdminMessagesAnniversaireComponent {
    constructor(
        private adminService: AdminService,
        private toastService: ToastService,
        private confirmationService: ConfirmationService,
        private dialogService: DialogService
    ) {}

    birthdayMessages = signal<BirthdayMessage[]>([])
    first = signal(0)
    rows = signal(10)
    total = signal(0)
    sortField = 'date'
    sortOrder = -1
    filters = {}
    loading = signal(true)

    getBirthdayMessages(
        first: number = 0,
        rows: number = this.rows(),
        sortField: string,
        sortOrder: number,
        filters: { [s: string]: FilterMetadata | undefined }
    ) {
        this.loading.set(true)
        this.adminService
            .getBirthdayMessages(first, rows, sortField, sortOrder, filters)
            .pipe(
                map((res) => {
                    const birthdayMessages = res.birthdayMessages
                    res.birthdayMessages = birthdayMessages.map((birthdayMessage) => {
                        return {
                            ...birthdayMessage,
                            date: new Intl.DateTimeFormat('fr-FR', {
                                dateStyle: 'short',
                                timeStyle: 'medium'
                            }).format(new Date(birthdayMessage.date))
                        }
                    })
                    return res
                }),
                finalize(() => {
                    this.loading.set(false)
                })
            )
            .subscribe((res) => {
                this.birthdayMessages.set(res.birthdayMessages)
                this.first.set(res.first)
                this.total.set(res.total)
            })
    }

    onLazyLoad(event: TableLazyLoadEvent) {
        this.getBirthdayMessages(
            event.first,
            event.rows ?? this.rows(),
            (event.sortField as string | null | undefined) ?? '',
            event.sortOrder ?? 1,
            (event.filters as { [s: string]: FilterMetadata | undefined }) ?? {}
        )
    }

    ref!: DynamicDialogRef<EditDialogComponent> | null

    showAddMessageDialog() {
        this.ref = this.dialogService.open(EditDialogComponent, {
            data: {
                action: 'add'
            },
            header: "Ajouter un message d'anniversaire",
            modal: true,
            dismissableMask: true,
            styleClass: 'w-full md:w-[50rem] sm:max-w-screen-sm mx-2 md:mx-0'
        })

        this.ref?.onClose.subscribe((message: string) => {
            if (message) {
                this.addBirthdayMessage(message)
            }
        })
    }

    addBirthdayMessage(message: string) {
        this.adminService.addBirthdayMessage(message).subscribe(() => {
            this.getBirthdayMessages(0, this.rows(), 'date', -1, {})
            this.toastService.showSuccess("Le message d'anniversaire a bien été ajouté")
        })
    }

    showEditMessageDialog(birthdayMessage: BirthdayMessage) {
        this.ref = this.dialogService.open(EditDialogComponent, {
            data: {
                action: 'modify',
                birthdayMessage
            },
            header: "Modifier un message d'anniversaire",
            dismissableMask: true,
            styleClass: 'w-full md:w-[50rem] sm:max-w-screen-sm mx-2 md:mx-0'
        })

        this.ref?.onClose.subscribe((message: string) => {
            if (message) {
                this.modifyBirthdayMessage(birthdayMessage, message)
            }
        })
    }

    modifyBirthdayMessage(birthdayMessage: BirthdayMessage, message: string) {
        this.adminService.modifyBirthdayMessage(birthdayMessage.id, message).subscribe(() => {
            birthdayMessage.message = message
            this.toastService.showSuccess("Le message d'anniversaire a bien été modifié")
        })
    }

    deleteConfirm(event: MouseEvent, table: Table, id: number) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            key: 'delete-message-dialog',
            header: "Supprimer un message d'anniversaire",
            message: 'Confirmer la suppression ?',
            icon: 'pi pi-info-circle',
            acceptButtonStyleClass: 'p-button-danger p-button-text',
            rejectButtonStyleClass: 'p-button-secondary p-button-text',
            accept: () => {
                this.deleteBirthdayMessage(table, id)
            }
        })
    }

    deleteBirthdayMessage(table: Table, id: number) {
        this.adminService
            .deleteBirthdayMessage(id)
            .pipe(
                catchError((error) => {
                    this.toastService.showError("Échec de la suppression du message d'anniversaire")
                    throw error
                })
            )
            .subscribe(() => {
                this.getBirthdayMessages(
                    this.first(),
                    this.rows(),
                    this.sortField,
                    this.sortOrder,
                    this.filters
                )
                this.toastService.showSuccess("Le message d'anniversaire à bien été supprimé")
            })
    }
}
