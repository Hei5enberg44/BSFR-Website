import { Component, Input, Output, EventEmitter } from '@angular/core'
import { NgIf, NgFor, NgClass } from '@angular/common'
import { TableModule, TablePageEvent } from 'primeng/table'
import { SkeletonModule } from 'primeng/skeleton'
import { AvatarModule } from 'primeng/avatar'
import { MessagesModule } from 'primeng/messages'
import { Message } from 'primeng/api'

import { RankedleHistory } from '../../../services/rankedle/rankedle.service'

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
export class RankedleHistoriqueComponent {
    @Input() history: RankedleHistory[] = []
    @Input() first = 0
    @Input() total = 0
    @Input() loading = false

    noHistoryMessage: Message[] = [
        {
            severity: 'info',
            closable: false,
            detail: "Il n'y a pas eu de Rankedle pour le moment."
        }
    ]

    @Output() onPage = new EventEmitter<TablePageEvent>()

    historyPageChange(event: TablePageEvent) {
        this.onPage.emit(event)
    }
}
