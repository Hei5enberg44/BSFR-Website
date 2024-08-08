import { Component, inject } from '@angular/core'
import { NgIf, AsyncPipe } from '@angular/common'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { SidebarModule } from 'primeng/sidebar'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import { DividerModule } from 'primeng/divider'
import { AvatarModule } from 'primeng/avatar'
import { TieredMenuModule } from 'primeng/tieredmenu'
import { MenuItem } from 'primeng/api'
import { MenuService } from '../../services/menu/menu.service'
import { AuthService } from '../../services/auth/auth.service'
import { UserService } from '../../services/user/user.service'
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
export class NavbarComponent {
    constructor(
        private authService: AuthService,
        private userService: UserService
    ) {}

    user$ = this.userService.user$
    isLogged$ = this.authService.isLogged$
    isOpen = false

    login() {
        this.authService.login()
        this.setIsOpen(false)
    }

    logout() {
        this.authService.logout()
        this.setIsOpen(false)
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

    userMenuItems: (MenuItem | { featherIcon: string })[] = [
        {
            label: 'Mon profil',
            route: 'profile',
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
