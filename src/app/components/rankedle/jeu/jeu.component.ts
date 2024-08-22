import { Component, OnInit } from '@angular/core'
import { NgIf } from '@angular/common'
import { CardModule } from 'primeng/card'
import { SkeletonModule } from 'primeng/skeleton'
import { MessagesModule } from 'primeng/messages'
import { Message } from 'primeng/api'

import {
    Rankedle,
    RankedleService
} from '../../../services/rankedle/rankedle.service'
import { finalize } from 'rxjs'

@Component({
    selector: 'app-rankedle-jeu',
    standalone: true,
    imports: [NgIf, CardModule, SkeletonModule, MessagesModule],
    templateUrl: './jeu.component.html',
    styleUrl: './jeu.component.scss'
})
export class RankedleJeuComponent implements OnInit {
    constructor(private rankedleService: RankedleService) {}

    ngOnInit(): void {
        this.getRankedle()
    }

    rankedle: Rankedle | null = null
    loading = true

    noRankedleMessage: Message[] = [
        {
            severity: 'info',
            icon: 'pi pi-info-circle',
            closable: false,
            detail: "Il n'y a pas de Rankedle en cours. Revenez plus tard."
        }
    ]

    getRankedle() {
        this.rankedle = null
        this.loading = true
        this.rankedleService
            .getCurrent()
            .pipe(
                finalize(() => {
                    this.loading = false
                })
            )
            .subscribe((res) => {
                this.rankedle = res
            })
    }
}
