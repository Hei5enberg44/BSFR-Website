import { Component, OnInit } from '@angular/core'
import { NgIf, AsyncPipe, NgFor, NgClass } from '@angular/common'
import { WithLoadingPipe } from '../../pipes/with-loading.pipe'
import { CardModule } from 'primeng/card'
import { TabViewModule, TabViewChangeEvent } from 'primeng/tabview'
import { SkeletonModule } from 'primeng/skeleton'
import { TableModule, TableRowExpandEvent } from 'primeng/table'
import { ButtonModule } from 'primeng/button'
import { AvatarModule } from 'primeng/avatar'
import { MessagesModule } from 'primeng/messages'
import { Message } from 'primeng/api'

import feather from 'feather-icons'
import { svgPipe } from '../../pipes/svg.pipe'
import { roundPipe } from '../../pipes/round.pipe'

import { RankedleService } from '../../services/rankedle/rankedle.service'

import { NotBsfrMemberComponent } from '../not-bsfr-member/not-bsfr-member.component'
import { UserService } from '../../services/user/user.service'

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

    tabIcons = {
        jeu: feather.icons.play,
        classement: feather.icons['bar-chart-2'],
        statistiques: feather.icons['pie-chart'],
        aide: feather.icons['help-circle']
    }

    activeTab: number = 1

    rankedle$ = this.rankedleService.rankedle$
    ranking$ = this.rankedleService.ranking$

    ngOnInit(): void {
        this.rankedle$ = this.rankedleService.getCurrent()
        this.ranking$ = this.rankedleService.getRanking()
    }

    onTabChange(event: TabViewChangeEvent) {
        switch (event.index) {
            case 0:
                this.rankedle$ = this.rankedleService.getCurrent()
                break
            case 1:
                this.ranking$ = this.rankedleService.getRanking()
                break
        }
    }

    rankingExpandedRows: { [key: string]: any } = {}
    playerStats = 1

    onRankingRowExpand(event: TableRowExpandEvent) {
        this.rankingExpandedRows = {}
        this.rankingExpandedRows[event.data.memberId] = true
    }
}
