import { Component, signal } from '@angular/core'
import { Router } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { SkeletonModule } from 'primeng/skeleton'
import { TableLazyLoadEvent, TableModule } from 'primeng/table'
import { SelectModule } from 'primeng/select'
import { AvatarModule } from 'primeng/avatar'
import { TagModule } from 'primeng/tag'
import { FilterMetadata } from 'primeng/api'

import { AdminService, CubeStalkerRequest } from '../../../services/admin/admin.service'
import { finalize } from 'rxjs'

@Component({
    selector: 'app-admin-cube-stalker',
    imports: [
        FormsModule,
        ButtonModule,
        SkeletonModule,
        TableModule,
        SelectModule,
        AvatarModule,
        TagModule
    ],
    templateUrl: './cube-stalker.component.html',
    styleUrl: './cube-stalker.component.scss'
})
export class AdminCubeStalkerComponent {
    constructor(
        private router: Router,
        private adminService: AdminService
    ) {}

    requests = signal<CubeStalkerRequest[]>([])
    first = signal(0)
    rows = signal(10)
    total = signal(0)
    loading = signal(true)

    statuses = [
        { label: 'En attente', value: 1 },
        { label: 'Approuvée', value: 2 },
        { label: 'Refusée', value: 3 }
    ]

    statusFilter: number | undefined

    getCubeStalkerRequests(
        first: number = 0,
        rows: number = this.rows(),
        sortField: string,
        sortOrder: number,
        filters: { [s: string]: FilterMetadata | undefined }
    ) {
        this.loading.set(true)
        this.adminService
            .getCubeStalkerRequests(first, rows, sortField, sortOrder, filters)
            .pipe(
                finalize(() => {
                    this.loading.set(false)
                })
            )
            .subscribe((res) => {
                this.requests.set(res.requests)
                this.first.set(res.first)
                this.total.set(res.total)
            })
    }

    getStatusName(status: 1 | 2 | 3) {
        switch (status) {
            case 1:
                return 'En attente'
            case 2:
                return 'Approuvée'
            case 3:
                return 'Refusée'
        }
    }

    getStatusSeverity(status: 1 | 2 | 3) {
        switch (status) {
            case 1:
                return 'info'
            case 2:
                return 'success'
            case 3:
                return 'danger'
        }
    }

    onLazyLoad(event: TableLazyLoadEvent) {
        this.getCubeStalkerRequests(
            event.first,
            event.rows ?? this.rows(),
            (event.sortField as string | null | undefined) ?? '',
            event.sortOrder ?? 1,
            (event.filters as { [s: string]: FilterMetadata | undefined }) ?? {}
        )
    }

    navigateToRequest(requestId: number) {
        this.router.navigate(['/admin/cube-stalker', requestId])
    }
}
