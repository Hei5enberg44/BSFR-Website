import { Component, signal } from '@angular/core'
import { SkeletonModule } from 'primeng/skeleton'
import { TableLazyLoadEvent, TableModule } from 'primeng/table'
import { AvatarModule } from 'primeng/avatar'
import { FilterMetadata } from 'primeng/api'

import { AdminService, Mute } from '../../../services/admin/admin.service'
import { finalize, map } from 'rxjs'

@Component({
    selector: 'app-admin-mutes',
    imports: [SkeletonModule, TableModule, AvatarModule],
    templateUrl: './mutes.component.html',
    styleUrl: './mutes.component.scss'
})
export class AdminMutesComponent {
    constructor(private adminService: AdminService) {}

    mutes = signal<Mute[]>([])
    first = signal(0)
    rows = signal(10)
    total = signal(0)
    loading = signal(true)

    getMutes(
        first: number = 0,
        rows: number = this.rows(),
        sortField: string,
        sortOrder: number,
        filters: { [s: string]: FilterMetadata | undefined }
    ) {
        this.loading.set(true)
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
                    this.loading.set(false)
                })
            )
            .subscribe((res) => {
                this.mutes.set(res.mutes)
                this.first.set(res.first)
                this.total.set(res.total)
            })
    }

    onLazyLoad(event: TableLazyLoadEvent) {
        this.getMutes(
            event.first,
            event.rows ?? this.rows(),
            (event.sortField as string | null | undefined) ?? '',
            event.sortOrder ?? 1,
            (event.filters as { [s: string]: FilterMetadata | undefined }) ?? {}
        )
    }
}
