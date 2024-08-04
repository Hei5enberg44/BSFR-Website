import { Component, OnInit } from '@angular/core'
import { NgIf, AsyncPipe, NgFor, NgClass } from '@angular/common'
import { WithLoadingPipe } from '../../pipes/with-loading.pipe'
import { CardModule } from 'primeng/card'
import { TabViewModule, TabViewChangeEvent } from 'primeng/tabview'
import { SkeletonModule } from 'primeng/skeleton'
import { TableModule, TableRowExpandEvent, TablePageEvent } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { AvatarModule } from 'primeng/avatar'
import { ProgressBarModule } from 'primeng/progressbar'
import { MessagesModule } from 'primeng/messages'
import { Message } from 'primeng/api'

import feather from 'feather-icons'
import { svgPipe } from '../../pipes/svg.pipe'
import { roundPipe } from '../../pipes/round.pipe'

import {
    RankedleHistory,
    RankedleService
} from '../../services/rankedle/rankedle.service'

import { NotBsfrMemberComponent } from '../not-bsfr-member/not-bsfr-member.component'
import { UserService } from '../../services/user/user.service'
import { finalize } from 'rxjs'

@Component({
    selector: 'app-rankedle',
    standalone: true,
    imports: [
        NgIf,
        AsyncPipe,
        NgFor,
        NgClass,
        WithLoadingPipe,
        CardModule,
        TabViewModule,
        SkeletonModule,
        TableModule,
        ButtonModule,
        AvatarModule,
        ProgressBarModule,
        MessagesModule,
        svgPipe,
        roundPipe,
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

    noRankedleMessage: Message[] = [
        {
            severity: 'info',
            closable: false,
            detail: "Il n'y a pas de Rankedle en cours. Revenez plus tard."
        }
    ]

    noRankingMessage: Message[] = [
        {
            severity: 'info',
            closable: false,
            detail: "Il n'y a pas de classement pour le moment."
        }
    ]

    noPlayerStatsMessage: Message[] = [
        {
            severity: 'info',
            closable: false,
            detail: 'Veuillez jouer à au moins un Rankedle cette saison pour voir vos statistiques.'
        }
    ]

    noHistoryMessage: Message[] = [
        {
            severity: 'info',
            closable: false,
            detail: "Il n'y a pas eu de Rankedle pour le moment."
        }
    ]

    tabIcons = {
        jeu: feather.icons.play,
        classement: feather.icons['bar-chart-2'],
        statistiques: feather.icons['pie-chart'],
        aide: feather.icons['help-circle']
    }

    activeTab: number = 0

    rankedle$ = this.rankedleService.rankedle$
    ranking$ = this.rankedleService.ranking$
    playerStats$ = this.rankedleService.playerStats$
    historyData: RankedleHistory[] = []
    historyFirst = 0
    historyTotal = 0
    historyLoading = false

    ngOnInit(): void {
        this.rankedle$ = this.rankedleService.getCurrent()
        // this.playerStats$ = this.rankedleService.getPlayerStats()
        // this.history$ = this.rankedleService.getHistory()
        // this.getHistory()
    }

    onTabChange(event: TabViewChangeEvent) {
        this.rankingExpandedRows = {}
        switch (event.index) {
            case 0:
                this.rankedle$ = this.rankedleService.getCurrent()
                break
            case 1:
                this.ranking$ = this.rankedleService.getRanking()
                break
            case 2:
                this.playerStats$ = this.rankedleService.getPlayerStats()
                break
            case 3:
                this.getHistory()
                break
        }
    }

    rankingExpandedRows: { [key: string]: any } = {}

    onRankingRowExpand(event: TableRowExpandEvent) {
        this.rankingExpandedRows = {}
        this.rankingExpandedRows[event.data.memberId] = true
    }

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
