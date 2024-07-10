import { Component, OnInit, inject } from '@angular/core'
import { NgIf, AsyncPipe } from '@angular/common'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { PrimeNGConfig } from 'primeng/api'
import { SidebarModule } from 'primeng/sidebar'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import { DividerModule } from 'primeng/divider'
import { AvatarModule } from 'primeng/avatar'
import { TieredMenuModule } from 'primeng/tieredmenu'
import { MenuItem } from 'primeng/api'
import { MenuService } from '../../services/menu/menu.service'
import { AuthService } from '../../services/auth/auth.service'
import feather from 'feather-icons'
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
        DividerModule,
        AvatarModule,
        TieredMenuModule,
        NgIf,
        AsyncPipe,
        svgPipe
    ],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
    constructor(
        private primengConfig: PrimeNGConfig,
        private authService: AuthService
    ) {}

    user$ = this.authService.user$
    isOpen = false

    login() {
        this.authService.login()
    }

    logout() {
        this.authService.logout()
    }

    ngOnInit(): void {
        this.primengConfig.ripple = true
    }

    setIsOpen = (isOpen: boolean) => {
        this.isOpen = isOpen
    }

    icons = {
        login: feather.icons['log-in'],
        logout: feather.icons['log-out']
    }

    menuService = inject(MenuService)

    menuItems = this.menuService.getMenuItems()

    menuItemLink =
        'no-underline text-[var(--text-color)] flex items-center cursor-pointer p-3 rounded-md hover:bg-[var(--surface-100)] transition-duration-150 transition-colors'
    menuItemLinkActive =
        'no-underline text-[var(--text-color)] flex items-center cursor-pointer p-3 rounded-md bg-[var(--primary-600)] hover:bg-[var(--primary-500)] transition-duration-150 transition-colors'

    userMenuItems: (MenuItem | { featherIcon: string })[] = [
        {
            label: 'Mon profil',
            featherIcon: feather.icons.user
        },
        {
            separator: true
        },
        {
            label: 'Déconnexion',
            command: this.logout.bind(this),
            featherIcon: feather.icons['log-out']
        }
    ]
}
