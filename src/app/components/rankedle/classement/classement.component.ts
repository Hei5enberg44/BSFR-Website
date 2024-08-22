import { Component, OnInit } from '@angular/core'
import { NgIf, AsyncPipe, NgFor, NgClass } from '@angular/common'
import { TableModule, TableRowExpandEvent } from 'primeng/table'
import { SkeletonModule } from 'primeng/skeleton'
import { ButtonModule } from 'primeng/button'
import { AvatarModule } from 'primeng/avatar'
import { MessagesModule } from 'primeng/messages'
import { Message } from 'primeng/api'

import { roundPipe } from '../../../pipes/round.pipe'

import {
    RankedlePlayerRankingData,
    RankedleService
} from '../../../services/rankedle/rankedle.service'
import { finalize } from 'rxjs'

@Component({
    selector: 'app-rankedle-classement',
    standalone: true,
    imports: [
        NgIf,
        AsyncPipe,
        NgFor,
        NgClass,
        TableModule,
        SkeletonModule,
        ButtonModule,
        AvatarModule,
        MessagesModule,
        roundPipe
    ],
    templateUrl: './classement.component.html',
    styleUrl: './classement.component.scss'
})
export class RankedleClassementComponent implements OnInit {
    constructor(private rankedleService: RankedleService) {}

    ngOnInit(): void {
        this.getRanking()
    }

    ranking: RankedlePlayerRankingData[] = []
    loading: boolean = false
    rankingExpandedRows: { [key: string]: any } = {}

    noRankingMessage: Message[] = [
        {
            severity: 'info',
            icon: 'pi pi-info-circle',
            closable: false,
            detail: "Il n'y a pas de classement pour le moment."
        }
    ]

    getRanking() {
        this.ranking = []
        this.loading = true
        this.rankedleService
            .getRanking()
            .pipe(
                finalize(() => {
                    this.loading = false
                })
            )
            .subscribe((res) => {
                this.ranking = res
            })
    }

    onRankingRowExpand(event: TableRowExpandEvent) {
        this.rankingExpandedRows = {}
        this.rankingExpandedRows[event.data.memberId] = true
    }
}
