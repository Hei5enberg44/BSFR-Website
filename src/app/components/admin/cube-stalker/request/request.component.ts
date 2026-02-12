import { Component, input, signal } from '@angular/core'
import { RouterModule } from '@angular/router'
import { CardModule } from 'primeng/card'
import { ButtonModule } from 'primeng/button'
import { SkeletonModule } from 'primeng/skeleton'
import { AvatarModule } from 'primeng/avatar'
import { TagModule } from 'primeng/tag'
import { MessageModule } from 'primeng/message'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { ConfirmationService } from 'primeng/api'
import { AdminService, CubeStalkerRequest } from '../../../../services/admin/admin.service'
import { CardPreview, MemberCardStatus, UserService } from '../../../../services/user/user.service'
import { ToastService } from '../../../../services/toast/toast.service'
import { catchError, finalize } from 'rxjs'

@Component({
    selector: 'app-admin-cube-stalker-request',
    imports: [
        RouterModule,
        CardModule,
        ButtonModule,
        SkeletonModule,
        AvatarModule,
        TagModule,
        MessageModule,
        ConfirmDialogModule
    ],
    templateUrl: './request.component.html',
    styleUrl: './request.component.scss'
})
export class AdminCubeStalkerRequestComponent {
    constructor(
        private adminService: AdminService,
        private userService: UserService,
        private confirmationService: ConfirmationService,
        private toastService: ToastService
    ) {}

    requestId = input.required<string>()
    cardRequest = signal<CubeStalkerRequest | null>(null)
    memberCard = signal<CardPreview | null>(null)
    requestLoading = signal(true)
    cardLoading = signal(true)
    canSave = signal(false)
    saving = signal(false)

    ngOnInit(): void {
        this.adminService
            .getCubeStalkerRequest(parseInt(this.requestId()))
            .subscribe((cardRequest) => {
                this.requestLoading.set(false)
                if (cardRequest !== null) {
                    this.cardRequest.set(cardRequest)
                    this.getCubeStalkerCard(cardRequest.member.id)
                } else {
                    this.cardLoading.set(false)
                }
            })
    }

    getCubeStalkerCard(memberId: string) {
        this.userService.getCardPreview(memberId).subscribe((memberCard) => {
            this.memberCard.set(memberCard)
            this.cardLoading.set(false)
            this.canSave.set(this.cardRequest()?.status === MemberCardStatus.Pending)
        })
    }

    getStatusName(status: MemberCardStatus) {
        switch (status) {
            case MemberCardStatus.Preview:
                return '?'
            case MemberCardStatus.Pending:
                return 'En attente'
            case MemberCardStatus.Approved:
                return 'Approuvée'
            case MemberCardStatus.Denied:
                return 'Refusée'
        }
    }

    getStatusSeverity(status: MemberCardStatus) {
        switch (status) {
            case MemberCardStatus.Preview:
                return 'secondary'
            case MemberCardStatus.Pending:
                return 'info'
            case MemberCardStatus.Approved:
                return 'success'
            case MemberCardStatus.Denied:
                return 'danger'
        }
    }

    confirmDeny(event: MouseEvent, memberId: string) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            key: 'card-request-dialog',
            header: 'Refuser la demande ?',
            acceptButtonStyleClass: 'p-button-danger p-button-text',
            rejectButtonStyleClass: 'p-button-text',
            acceptIcon: 'none',
            rejectIcon: 'none',
            accept: () => {
                this.deny(memberId)
            }
        })
    }

    deny(memberId: string) {
        this.saving.set(true)
        this.canSave.set(false)
        this.adminService
            .denyCubeStalkerRequest(memberId)
            .pipe(
                catchError((error) => {
                    this.canSave.set(true)
                    throw error
                }),
                finalize(() => {
                    this.saving.set(false)
                })
            )
            .subscribe(() => {
                this.cardRequest.update((r) => {
                    if (r) r.status = MemberCardStatus.Denied
                    return r
                })
                this.toastService.showSuccess('La demande a bien été refusée')
            })
    }

    confirmApproval(event: MouseEvent, memberId: string) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            key: 'card-request-dialog',
            header: 'Approuver la demande ?',
            acceptButtonStyleClass: 'p-button-success p-button-text',
            rejectButtonStyleClass: 'p-button-text',
            acceptIcon: 'none',
            rejectIcon: 'none',
            accept: () => {
                this.approve(memberId)
            }
        })
    }

    approve(memberId: string) {
        this.saving.set(true)
        this.canSave.set(false)
        this.adminService
            .approveCubeStalkerRequest(memberId)
            .pipe(
                catchError((error) => {
                    this.canSave.set(true)
                    throw error
                }),
                finalize(() => {
                    this.saving.set(false)
                })
            )
            .subscribe(() => {
                this.cardRequest.update((r) => {
                    if (r) r.status = MemberCardStatus.Approved
                    return r
                })
                this.toastService.showSuccess('La demande a bien été approuvée')
            })
    }
}
