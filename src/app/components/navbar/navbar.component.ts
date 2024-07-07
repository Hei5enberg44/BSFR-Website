import { Component, OnInit, inject } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { PrimeNGConfig } from 'primeng/api'
import { SidebarModule } from 'primeng/sidebar'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import { MenuService } from '../../services/menu/menu.service'
import { svgPipe } from '../../pipes/svg.pipe'

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [
        RouterLink,
        RouterLinkActive,
        SidebarModule,
        ButtonModule,
        RippleModule,
        svgPipe
    ],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
    constructor(private primengConfig: PrimeNGConfig) {}

    ngOnInit(): void {
        this.primengConfig.ripple = true
    }

    isOpen = false

    setIsOpen = (isOpen: boolean) => {
        this.isOpen = isOpen
    }

    menuService = inject(MenuService)

    menuItems = this.menuService.getMenuItems()

    menuItemLink =
        'p-ripple p-element no-underline text-[var(--text-color)] flex items-center cursor-pointer p-3 rounded-md hover:bg-[var(--surface-100)] transition-duration-150 transition-colors'
    menuItemLinkActive =
        'p-ripple p-element no-underline text-[var(--text-color)] flex items-center cursor-pointer p-3 rounded-md bg-[var(--primary-600)] hover:bg-[var(--primary-500)] transition-duration-150 transition-colors'

    logged = false
}
