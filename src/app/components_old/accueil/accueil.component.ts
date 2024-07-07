import { Component } from '@angular/core'
import { CardModule } from 'primeng/card'
import { DividerModule } from 'primeng/divider'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import feather from 'feather-icons'
import { svgPipe } from '../../pipes/svg.pipe'

@Component({
    selector: 'app-accueil',
    standalone: true,
    imports: [CardModule, DividerModule, ButtonModule, RippleModule, svgPipe],
    templateUrl: './accueil.component.html',
    styleUrl: './accueil.component.scss'
})
export class AccueilComponent {
    icons = {
        download: feather.icons.download
    }
}
