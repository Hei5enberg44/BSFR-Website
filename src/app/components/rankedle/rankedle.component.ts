import { Component } from '@angular/core'
import { CardModule } from 'primeng/card'

@Component({
    selector: 'app-rankedle',
    standalone: true,
    imports: [CardModule],
    templateUrl: './rankedle.component.html',
    styleUrl: './rankedle.component.scss'
})
export class RankedleComponent {}
