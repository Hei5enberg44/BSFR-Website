import { Component, signal } from '@angular/core'
import { SkeletonModule } from 'primeng/skeleton'
import { TableLazyLoadEvent, TableModule } from 'primeng/table'
import { AvatarModule } from 'primeng/avatar'
import { FilterMetadata } from 'primeng/api'

import { AdminService, Birthday } from '../../../services/admin/admin.service'
import { finalize, map } from 'rxjs'

@Component({
    selector: 'app-admin-anniversaires',
    imports: [SkeletonModule, TableModule, AvatarModule],
    templateUrl: './anniversaires.component.html',
    styleUrl: './anniversaires.component.scss'
})
export class AdminAnniversairesComponent {
    constructor(private adminService: AdminService) {}

    birthdays = signal<Birthday[]>([])
    first = signal(0)
    rows = signal(10)
    total = signal(0)
    loading = signal(true)

    getBirthdays(
        first: number = 0,
        rows: number = this.rows(),
        sortField: string,
        sortOrder: number,
        filters: { [s: string]: FilterMetadata | undefined }
    ) {
        this.loading.set(true)
        this.adminService
            .getBirthdays(first, rows, sortField, sortOrder, filters)
            .pipe(
                map((res) => {
                    const birthdays = res.birthdays
                    res.birthdays = birthdays.map((birthday) => {
                        return {
                            ...birthday,
                            date: new Intl.DateTimeFormat('fr-FR').format(new Date(birthday.date))
                        }
                    })
                    return res
                }),
                finalize(() => {
                    this.loading.set(false)
                })
            )
            .subscribe((res) => {
                this.birthdays.set(res.birthdays)
                this.first.set(res.first)
                this.total.set(res.total)
            })
    }

    onLazyLoad(event: TableLazyLoadEvent) {
        this.getBirthdays(
            event.first,
            event.rows ?? this.rows(),
            (event.sortField as string | null | undefined) ?? '',
            event.sortOrder ?? 1,
            (event.filters as { [s: string]: FilterMetadata | undefined }) ?? {}
        )
    }
}
