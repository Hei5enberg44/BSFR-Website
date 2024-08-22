import { Component } from '@angular/core'
import { NgIf, NgFor } from '@angular/common'
import { SkeletonModule } from 'primeng/skeleton'
import { TableLazyLoadEvent, TableModule } from 'primeng/table'
import { AvatarModule } from 'primeng/avatar'
import { FilterMetadata } from 'primeng/api'

import { AdminService, Mute } from '../../../services/admin/admin.service'
import { finalize, map } from 'rxjs'

@Component({
    selector: 'app-admin-mutes',
    standalone: true,
    imports: [NgIf, NgFor, SkeletonModule, TableModule, AvatarModule],
    templateUrl: './mutes.component.html',
    styleUrl: './mutes.component.scss'
})
export class AdminMutesComponent {
    constructor(private adminService: AdminService) {}

    mutes: Mute[] = []
    first = 0
    rows = 10
    total = 0
    loading = true

    getMutes(
        first: number = 0,
        rows: number = this.rows,
        sortField: string,
        sortOrder: number,
        filters: { [s: string]: FilterMetadata | undefined }
    ) {
        this.loading = true
        this.adminService
            .getMutes(first, rows, sortField, sortOrder, filters)
            .pipe(
                map((res) => {
                    const mutes = res.mutes
                    res.mutes = mutes.map((mute) => {
                        return {
                            ...mute,
                            muteDate: new Intl.DateTimeFormat('fr-FR', {
                                dateStyle: 'short',
                                timeStyle: 'medium'
                            }).format(new Date(mute.muteDate)),
                            unmuteDate: new Intl.DateTimeFormat('fr-FR', {
                                dateStyle: 'short',
                                timeStyle: 'medium'
                            }).format(new Date(mute.unmuteDate))
                        }
                    })
                    return res
                }),
                finalize(() => {
                    this.loading = false
                })
            )
            .subscribe((res) => {
                this.mutes = res.mutes
                this.first = res.first
                this.total = res.total
            })
    }

    onLazyLoad(event: TableLazyLoadEvent) {
        this.getMutes(
            event.first,
            event.rows ?? this.rows,
            (event.sortField as string | null | undefined) ?? '',
            event.sortOrder ?? 1,
            (event.filters as { [s: string]: FilterMetadata | undefined }) ?? {}
        )
    }
}
