import { Component, Input } from '@angular/core'
import { NgIf, NgFor } from '@angular/common'
import { CardModule } from 'primeng/card'
import { SkeletonModule } from 'primeng/skeleton'

import { RankedlePlayerStats } from '../../../services/rankedle/rankedle.service'

import { roundPipe } from '../../../pipes/round.pipe'

@Component({
    selector: 'app-rankedle-statistiques',
    standalone: true,
    imports: [NgIf, NgFor, CardModule, SkeletonModule, roundPipe],
    templateUrl: './statistiques.component.html',
    styleUrl: './statistiques.component.scss'
})
export class RankedleStatistiquesComponent {
    @Input() stats: RankedlePlayerStats | null = null
    @Input() loading = false
}
