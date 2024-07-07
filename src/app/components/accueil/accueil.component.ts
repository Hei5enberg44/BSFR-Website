import { Component, OnInit } from '@angular/core'
import { NgIf, AsyncPipe } from '@angular/common'
import { CardModule } from 'primeng/card'
import { DividerModule } from 'primeng/divider'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import feather from 'feather-icons'
import { svgPipe } from '../../pipes/svg.pipe'
import { Observable } from 'rxjs'

@Component({
    selector: 'app-accueil',
    standalone: true,
    imports: [
        NgIf,
        AsyncPipe,
        CardModule,
        DividerModule,
        ButtonModule,
        RippleModule,
        svgPipe
    ],
    templateUrl: './accueil.component.html',
    styleUrl: './accueil.component.scss'
})
export class AccueilComponent implements OnInit {
    icons = {
        download: feather.icons.download
    }

    ngOnInit(): void {}
}
