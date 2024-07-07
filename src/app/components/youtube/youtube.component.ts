import { Component } from '@angular/core'
import { CardModule } from 'primeng/card'

@Component({
    selector: 'app-youtube',
    standalone: true,
    imports: [CardModule],
    templateUrl: './youtube.component.html',
    styleUrl: './youtube.component.scss'
})
export class YouTubeComponent {}
