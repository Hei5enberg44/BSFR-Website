import { Component, OnInit } from '@angular/core'
import { NgIf, NgFor, NgClass } from '@angular/common'
import { TableModule, TablePageEvent } from 'primeng/table'
import { SkeletonModule } from 'primeng/skeleton'
import { AvatarModule } from 'primeng/avatar'
import { MessagesModule } from 'primeng/messages'
import { Message } from 'primeng/api'

import {
    RankedleHistory,
    RankedleService
} from '../../../services/rankedle/rankedle.service'
import { finalize } from 'rxjs'

@Component({
    selector: 'app-rankedle-historique',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        NgClass,
        TableModule,
        SkeletonModule,
        AvatarModule,
        MessagesModule
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

    noHistoryMessage: Message[] = [
        {
            severity: 'info',
            icon: 'pi pi-info-circle',
            closable: false,
            detail: "Il n'y a pas eu de Rankedle pour le moment."
        }
    ]

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
