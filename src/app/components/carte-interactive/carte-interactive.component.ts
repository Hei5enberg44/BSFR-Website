import { Component } from '@angular/core'
import { CardModule } from 'primeng/card'

@Component({
    selector: 'app-carteinteractive',
    standalone: true,
    imports: [CardModule],
    templateUrl: './carte-interactive.component.html',
    styleUrl: './carte-interactive.component.scss'
})
export class CarteInteractiveComponent {}
