import { Component, OnInit } from '@angular/core'
import { NgIf, NgFor } from '@angular/common'
import { CardModule } from 'primeng/card'
import { SkeletonModule } from 'primeng/skeleton'

import { roundPipe } from '../../../pipes/round.pipe'

import {
    RankedlePlayerStats,
    RankedleService
} from '../../../services/rankedle/rankedle.service'
import { finalize } from 'rxjs'

@Component({
    selector: 'app-rankedle-statistiques',
    imports: [NgIf, NgFor, CardModule, SkeletonModule, roundPipe],
    templateUrl: './statistiques.component.html',
    styleUrl: './statistiques.component.scss'
})
export class RankedleStatistiquesComponent implements OnInit {
    constructor(private rankedleService: RankedleService) {}

    ngOnInit(): void {
        this.getPlayerStats()
    }

    stats: RankedlePlayerStats | null = null
    loading = false

    getPlayerStats() {
        this.stats = null
        this.loading = true
        this.rankedleService
            .getPlayerStats()
            .pipe(
                finalize(() => {
                    this.loading = false
                })
            )
            .subscribe((res) => {
                this.stats = res
            })
    }
}
