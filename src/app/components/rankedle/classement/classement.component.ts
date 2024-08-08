import { Component, Input } from '@angular/core'
import { NgIf, AsyncPipe, NgFor, NgClass } from '@angular/common'
import { TableModule, TableRowExpandEvent } from 'primeng/table'
import { SkeletonModule } from 'primeng/skeleton'
import { ButtonModule } from 'primeng/button'
import { AvatarModule } from 'primeng/avatar'
import { MessagesModule } from 'primeng/messages'
import { Message } from 'primeng/api'

import { roundPipe } from '../../../pipes/round.pipe'

import { RankedlePlayerRankingData } from '../../../services/rankedle/rankedle.service'

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
export class RankedleClassementComponent {
    @Input() ranking: RankedlePlayerRankingData[] = []
    @Input() loading: boolean = false
    @Input() rankingExpandedRows: { [key: string]: any } = {}

    noRankingMessage: Message[] = [
        {
            severity: 'info',
            closable: false,
            detail: "Il n'y a pas de classement pour le moment."
        }
    ]

    onRankingRowExpand(event: TableRowExpandEvent) {
        this.rankingExpandedRows = {}
        this.rankingExpandedRows[event.data.memberId] = true
    }
}
