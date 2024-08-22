import { Component, Input } from '@angular/core'
import { NgIf, AsyncPipe } from '@angular/common'
import { RouterModule } from '@angular/router'
import { CardModule } from 'primeng/card'
import { ButtonModule } from 'primeng/button'
import { SkeletonModule } from 'primeng/skeleton'
import { AvatarModule } from 'primeng/avatar'
import { TagModule } from 'primeng/tag'
import { MessagesModule } from 'primeng/messages'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { ConfirmationService, Message } from 'primeng/api'
import {
    AdminService,
    CubeStalkerRequest
} from '../../../../services/admin/admin.service'
import {
    CardPreview,
    MemberCardStatus,
    UserService
} from '../../../../services/user/user.service'
import { ToastService } from '../../../../services/toast/toast.service'
import { catchError, finalize } from 'rxjs'

@Component({
    selector: 'app-admin-cube-stalker-request',
    standalone: true,
    imports: [
        RouterModule,
        NgIf,
        AsyncPipe,
        CardModule,
        ButtonModule,
        SkeletonModule,
        AvatarModule,
        TagModule,
        MessagesModule,
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

    @Input() id!: string

    cardRequest!: CubeStalkerRequest
    memberCard: CardPreview | null = null
    invalidRequest = false
    requestLoading = true
    cardLoading = true
    canSave = false
    saving = false

    unkownRequestMessage: Message[] = [
        {
            closable: false,
            severity: 'info',
            icon: 'pi pi-info-circle',
            detail: "La demande d'image de carte Cube-Stalker recherchée n'existe pas."
        }
    ]

    ngOnInit(): void {
        this.adminService
            .getCubeStalkerRequest(parseInt(this.id))
            .subscribe((cardRequest) => {
                this.requestLoading = false
                this.invalidRequest = cardRequest === null
                if (cardRequest !== null) {
                    this.cardRequest = cardRequest
                    this.getCubeStalkerCard(cardRequest.member.id)
                } else {
                    this.cardLoading = false
                }
            })
    }

    getCubeStalkerCard(memberId: string) {
        this.userService.getCardPreview(memberId).subscribe((memberCard) => {
            this.memberCard = memberCard
            this.cardLoading = false
            this.canSave = this.cardRequest?.status === MemberCardStatus.Pending
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
        this.saving = true
        this.canSave = false
        this.adminService
            .denyCubeStalkerRequest(memberId)
            .pipe(
                catchError((error) => {
                    this.canSave = true
                    throw error
                }),
                finalize(() => {
                    this.saving = false
                })
            )
            .subscribe(() => {
                this.cardRequest.status = MemberCardStatus.Denied
                this.toastService.showSuccess('La demande a bien été refusée')
            })
    }

    confirmApproval(event: MouseEvent, memberId: string) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
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
        this.saving = true
        this.canSave = false
        this.adminService
            .approveCubeStalkerRequest(memberId)
            .pipe(
                catchError((error) => {
                    this.canSave = true
                    throw error
                }),
                finalize(() => {
                    this.saving = false
                })
            )
            .subscribe(() => {
                this.cardRequest.status = MemberCardStatus.Approved
                this.toastService.showSuccess('La demande a bien été approuvée')
            })
    }
}
