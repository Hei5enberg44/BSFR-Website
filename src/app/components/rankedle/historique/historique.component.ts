import { Component, OnInit } from '@angular/core'
import { NgIf, NgFor, NgClass } from '@angular/common'
import { TableModule, TablePageEvent } from 'primeng/table'
import { SkeletonModule } from 'primeng/skeleton'
import { AvatarModule } from 'primeng/avatar'
import { Message } from 'primeng/message'

import {
    RankedleHistory,
    RankedleService
} from '../../../services/rankedle/rankedle.service'
import { finalize } from 'rxjs'

@Component({
    selector: 'app-rankedle-historique',
    imports: [
        NgIf,
        NgFor,
        NgClass,
        TableModule,
        SkeletonModule,
        AvatarModule,
        Message
    ],
    templateUrl: './historique.component.html',
    styleUrl: './historique.component.scss'
})
export class RankedleHistoriqueComponent implements OnInit {
    constructor(private rankedleService: RankedleService) {}

    ngOnInit(): void {
        this.getHistory()
    }

    history: RankedleHistory[] = []
    first = 0
    total = 0
    loading = false

    getHistory(first: number = 0, rows: number = 10) {
        this.loading = true
        this.rankedleService
            .getHistory(first, rows)
            .pipe(
                finalize(() => {
                    this.loading = false
                })
            )
            .subscribe((res) => {
                this.history = res.history
                this.first = res.first
                this.total = res.total
            })
    }

    pageChange(event: TablePageEvent) {
        this.getHistory(event.first, event.rows)
    }
}
