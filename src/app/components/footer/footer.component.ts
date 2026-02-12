import { Component } from '@angular/core'
import { RippleModule } from 'primeng/ripple'
import { TooltipModule } from 'primeng/tooltip'

@Component({
    selector: 'app-footer',
    imports: [RippleModule, TooltipModule],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss'
})
export class FooterComponent {}
