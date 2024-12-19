import { Component } from '@angular/core'
import { NgIf, NgFor } from '@angular/common'
import { SkeletonModule } from 'primeng/skeleton'
import { TableLazyLoadEvent, TableModule } from 'primeng/table'
import { AvatarModule } from 'primeng/avatar'
import { FilterMetadata } from 'primeng/api'

import {
    AdminService,
    TwitchChannel
} from '../../../services/admin/admin.service'
import { finalize } from 'rxjs'

@Component({
    selector: 'app-admin-twitch',
    imports: [NgIf, NgFor, SkeletonModule, TableModule, AvatarModule],
    templateUrl: './twitch.component.html',
    styleUrl: './twitch.component.scss'
})
export class AdminTwitchComponent {
    constructor(private adminService: AdminService) {}

    twitchChannels: TwitchChannel[] = []
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
            .getTwitchChannels(first, rows, sortField, sortOrder, filters)
            .pipe(
                finalize(() => {
                    this.loading = false
                })
            )
            .subscribe((res) => {
                this.twitchChannels = res.twitchChannels
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
