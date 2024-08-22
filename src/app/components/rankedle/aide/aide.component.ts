import { Component } from '@angular/core'
import { CardModule } from 'primeng/card'
import { TableModule } from 'primeng/table'

@Component({
    selector: 'app-rankedle-aide',
    standalone: true,
    imports: [CardModule, TableModule],
    templateUrl: './aide.component.html',
    styleUrl: './aide.component.scss'
})
export class RankedleAideComponent {}
