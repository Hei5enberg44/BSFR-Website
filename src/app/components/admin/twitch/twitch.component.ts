import { Component, signal } from '@angular/core'
import { SkeletonModule } from 'primeng/skeleton'
import { TableLazyLoadEvent, TableModule } from 'primeng/table'
import { AvatarModule } from 'primeng/avatar'
import { FilterMetadata } from 'primeng/api'

import { AdminService, TwitchChannel } from '../../../services/admin/admin.service'
import { finalize } from 'rxjs'

@Component({
    selector: 'app-admin-twitch',
    imports: [SkeletonModule, TableModule, AvatarModule],
    templateUrl: './twitch.component.html',
    styleUrl: './twitch.component.scss'
})
export class AdminTwitchComponent {
    constructor(private adminService: AdminService) {}

    twitchChannels = signal<TwitchChannel[]>([])
    first = signal(0)
    rows = signal(10)
    total = signal(0)
    loading = signal(true)

    getBans(
        first: number = 0,
        rows: number = this.rows(),
        sortField: string,
        sortOrder: number,
        filters: { [s: string]: FilterMetadata | undefined }
    ) {
        this.loading.set(true)
        this.adminService
            .getTwitchChannels(first, rows, sortField, sortOrder, filters)
            .pipe(
                finalize(() => {
                    this.loading.set(false)
                })
            )
            .subscribe((res) => {
                this.twitchChannels.set(res.twitchChannels)
                this.first.set(res.first)
                this.total.set(res.total)
            })
    }

    onLazyLoad(event: TableLazyLoadEvent) {
        this.getBans(
            event.first,
            event.rows ?? this.rows(),
            (event.sortField as string | null | undefined) ?? '',
            event.sortOrder ?? 1,
            (event.filters as { [s: string]: FilterMetadata | undefined }) ?? {}
        )
    }
}
