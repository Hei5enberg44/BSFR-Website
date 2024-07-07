import { Component } from '@angular/core'
import { CardModule } from 'primeng/card'

@Component({
    selector: 'app-multipov',
    standalone: true,
    imports: [CardModule],
    templateUrl: './multi-pov.component.html',
    styleUrl: './multi-pov.component.scss'
})
export class MultiPovComponent {}
