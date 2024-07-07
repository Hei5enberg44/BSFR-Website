import { Component, inject } from '@angular/core'
import { RouterLink } from '@angular/router'
import { NavbarComponent } from '../navbar/navbar.component'
import { RippleModule } from 'primeng/ripple'
import { TooltipModule } from 'primeng/tooltip'
import { MenuService } from '../../services/menu/menu.service'
import { svgPipe } from '../../pipes/svg.pipe'

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [
        RouterLink,
        NavbarComponent,
        RippleModule,
        TooltipModule,
        svgPipe
    ],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.scss'
})
export class FooterComponent {
    menuService = inject(MenuService)

    menuItems = this.menuService.getMenuItems()
}
