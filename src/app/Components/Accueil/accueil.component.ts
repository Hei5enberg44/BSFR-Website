import { Component } from '@angular/core'
import feather from 'feather-icons'
import { svgPipe } from '../../Pipes/svg.pipe'

@Component({
    selector: 'app-accueil',
    standalone: true,
    imports: [svgPipe],
    templateUrl: './accueil.component.html',
    styleUrl: './accueil.component.scss'
})
export class AccueilComponent {
    icons = {
        youtube: feather.icons.youtube,
        twitch: feather.icons.twitch,
        twitter: feather.icons.twitter,
        download: feather.icons.download
    }
}
