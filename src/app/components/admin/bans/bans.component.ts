import { Component } from '@angular/core'
import { NgIf, NgFor } from '@angular/common'
import { SkeletonModule } from 'primeng/skeleton'
import { TableLazyLoadEvent, TableModule } from 'primeng/table'
import { AvatarModule } from 'primeng/avatar'
import { FilterMetadata } from 'primeng/api'

import { AdminService, Ban } from '../../../services/admin/admin.service'
import { finalize, map } from 'rxjs'

@Component({
    selector: 'app-admin-bans',
    standalone: true,
    imports: [NgIf, NgFor, SkeletonModule, TableModule, AvatarModule],
    templateUrl: './bans.component.html',
    styleUrl: './bans.component.scss'
})
export class AdminBansComponent {
    constructor(private adminService: AdminService) {}

    bans: Ban[] = []
    first = 0
    rows = 10
    total = 0
    loading = true

    getBans(
        first: number = 0,
        rows: number = this.rows,
        sortField: string,
        sortOrder: number,
        filters: { [s: string]: FilterMetadata | undefined }
    ) {
        this.loading = true
        this.adminService
            .getBans(first, rows, sortField, sortOrder, filters)
            .pipe(
                map((res) => {
                    const bans = res.bans
                    res.bans = bans.map((ban) => {
                        return {
                            ...ban,
                            banDate: new Intl.DateTimeFormat('fr-FR', {
                                dateStyle: 'short',
                                timeStyle: 'medium'
                            }).format(new Date(ban.banDate)),
                            unbanDate: new Intl.DateTimeFormat('fr-FR', {
                                dateStyle: 'short',
                                timeStyle: 'medium'
                            }).format(new Date(ban.unbanDate))
                        }
                    })
                    return res
                }),
                finalize(() => {
                    this.loading = false
                })
            )
            .subscribe((res) => {
                this.bans = res.bans
                this.first = res.first
                this.total = res.total
            })
    }

    onLazyLoad(event: TableLazyLoadEvent) {
        this.getBans(
            event.first,
            event.rows ?? this.rows,
            (event.sortField as string | null | undefined) ?? '',
            event.sortOrder ?? 1,
            (event.filters as { [s: string]: FilterMetadata | undefined }) ?? {}
        )
    }
}
