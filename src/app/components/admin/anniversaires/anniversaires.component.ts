import { Component } from '@angular/core'
import { NgIf, NgFor } from '@angular/common'
import { SkeletonModule } from 'primeng/skeleton'
import { TableLazyLoadEvent, TableModule } from 'primeng/table'
import { AvatarModule } from 'primeng/avatar'
import { FilterMetadata } from 'primeng/api'

import { AdminService, Birthday } from '../../../services/admin/admin.service'
import { finalize, map } from 'rxjs'

@Component({
    selector: 'app-admin-anniversaires',
    standalone: true,
    imports: [NgIf, NgFor, SkeletonModule, TableModule, AvatarModule],
    templateUrl: './anniversaires.component.html',
    styleUrl: './anniversaires.component.scss'
})
export class AdminAnniversairesComponent {
    constructor(private adminService: AdminService) {}

    birthdays: Birthday[] = []
    first = 0
    rows = 10
    total = 0
    loading = true

    getBirthdays(
        first: number = 0,
        rows: number = this.rows,
        sortField: string,
        sortOrder: number,
        filters: { [s: string]: FilterMetadata | undefined }
    ) {
        this.loading = true
        this.adminService
            .getBirthdays(first, rows, sortField, sortOrder, filters)
            .pipe(
                map((res) => {
                    const birthdays = res.birthdays
                    res.birthdays = birthdays.map((birthday) => {
                        return {
                            ...birthday,
                            date: new Intl.DateTimeFormat('fr-FR').format(
                                new Date(birthday.date)
                            )
                        }
                    })
                    return res
                }),
                finalize(() => {
                    this.loading = false
                })
            )
            .subscribe((res) => {
                this.birthdays = res.birthdays
                this.first = res.first
                this.total = res.total
            })
    }

    onLazyLoad(event: TableLazyLoadEvent) {
        this.getBirthdays(
            event.first,
            event.rows ?? this.rows,
            (event.sortField as string | null | undefined) ?? '',
            event.sortOrder ?? 1,
            (event.filters as { [s: string]: FilterMetadata | undefined }) ?? {}
        )
    }
}
