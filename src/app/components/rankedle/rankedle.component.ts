import { Component, OnInit } from '@angular/core'
import { NgIf, AsyncPipe } from '@angular/common'
import { WithLoadingPipe } from '../../pipes/with-loading.pipe'
import { CardModule } from 'primeng/card'
import { TabViewModule, TabViewChangeEvent } from 'primeng/tabview'
import { SkeletonModule } from 'primeng/skeleton'
import { TablePageEvent } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { MessagesModule } from 'primeng/messages'
import { Message } from 'primeng/api'

import {
    RankedleHistory,
    RankedlePlayerRankingData,
    RankedlePlayerStats,
    RankedleService
} from '../../services/rankedle/rankedle.service'
import { finalize } from 'rxjs'

import { RankedleClassementComponent } from './classement/classement.component'
import { RankedleStatistiquesComponent } from './statistiques/statistiques.component'
import { RankedleHistoriqueComponent } from './historique/historique.component'
import { RankedleAideComponent } from './aide/aide.component'

import { NotBsfrMemberComponent } from '../not-bsfr-member/not-bsfr-member.component'
import { UserService } from '../../services/user/user.service'

@Component({
    selector: 'app-rankedle',
    standalone: true,
    imports: [
        NgIf,
        AsyncPipe,
        WithLoadingPipe,
        CardModule,
        TabViewModule,
        SkeletonModule,
        ButtonModule,
        MessagesModule,
        RankedleClassementComponent,
        RankedleStatistiquesComponent,
        RankedleHistoriqueComponent,
        RankedleAideComponent,
        NotBsfrMemberComponent
    ],
    templateUrl: './rankedle.component.html',
    styleUrl: './rankedle.component.scss'
})
export class RankedleComponent implements OnInit {
    isBSFR: boolean = false

    constructor(
        private userService: UserService,
        private rankedleService: RankedleService
    ) {
        this.userService.user$.subscribe((user) => {
            this.isBSFR = user?.isBSFR ?? false
        })
    }

    // Messages
    noRankedleMessage: Message[] = [
        {
            severity: 'info',
            icon: 'pi pi-info-circle',
            closable: false,
            detail: "Il n'y a pas de Rankedle en cours. Revenez plus tard."
        }
    ]

    ngOnInit(): void {
        this.rankedle$ = this.rankedleService.getCurrent()
    }

    // Onglets
    activeTab: number = 0

    onTabChange(event: TabViewChangeEvent) {
        this.rankingExpandedRows = {}
        switch (event.index) {
            case 0:
                this.rankedle$ = this.rankedleService.getCurrent()
                break
            case 1:
                this.getRanking()
                break
            case 2:
                this.getPlayerStats()
                break
            case 3:
                this.getHistory()
                break
        }
    }

    // Jeu
    rankedle$ = this.rankedleService.rankedle$

    // Statistiques
    playerStatsData: RankedlePlayerStats | null = null
    playerStatsLoading = false

    getPlayerStats() {
        this.playerStatsData = null
        this.playerStatsLoading = true
        this.rankedleService
            .getPlayerStats()
            .pipe(
                finalize(() => {
                    this.playerStatsLoading = false
                })
            )
            .subscribe((res) => {
                this.playerStatsData = res
            })
    }

    // Classement
    rankingData: RankedlePlayerRankingData[] = []
    rankingLoading = false
    rankingExpandedRows: { [key: string]: any } = {}

    getRanking() {
        this.rankingData = []
        this.rankingLoading = true
        this.rankedleService
            .getRanking()
            .pipe(
                finalize(() => {
                    this.rankingLoading = false
                })
            )
            .subscribe((res) => {
                this.rankingData = res
            })
    }

    // Historique
    historyData: RankedleHistory[] = []
    historyFirst = 0
    historyTotal = 0
    historyLoading = false

    getHistory(first: number = 0, rows: number = 10) {
        this.historyData = []
        this.historyLoading = true
        this.rankedleService
            .getHistory(first, rows)
            .pipe(
                finalize(() => {
                    this.historyLoading = false
                })
            )
            .subscribe((res) => {
                this.historyData = res.history
                this.historyFirst = res.first
                this.historyTotal = res.total
            })
    }

    historyPageChange(event: TablePageEvent) {
        this.getHistory(event.first, event.rows)
    }
}
