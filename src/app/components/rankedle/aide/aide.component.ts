import { Component } from '@angular/core'
import { TableModule } from 'primeng/table'

@Component({
    selector: 'app-rankedle-aide',
    standalone: true,
    imports: [TableModule],
    templateUrl: './aide.component.html',
    styleUrl: './aide.component.scss'
})
export class RankedleAideComponent {}
