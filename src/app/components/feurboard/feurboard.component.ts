import { Component } from '@angular/core'
import { CardModule } from 'primeng/card'

@Component({
    selector: 'app-feurboard',
    standalone: true,
    imports: [CardModule],
    templateUrl: './feurboard.component.html',
    styleUrl: './feurboard.component.scss'
})
export class FeurboardComponent {}
