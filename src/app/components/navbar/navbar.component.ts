import { Component } from '@angular/core'
import { RouterModule } from '@angular/router'
import { NgIf, NgFor, AsyncPipe } from '@angular/common'
import { SidebarModule } from 'primeng/sidebar'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import { DividerModule } from 'primeng/divider'
import { AvatarModule } from 'primeng/avatar'
import { Menu } from 'primeng/menu'
import { MenuItem } from 'primeng/api'
import { MenuService } from '../../services/menu/menu.service'
import { UserService } from '../../services/user/user.service'
import { svgPipe } from '../../pipes/svg.pipe'

@Component({
    selector: 'app-navbar',
    imports: [
        RouterModule,
        NgIf,
        NgFor,
        AsyncPipe,
        svgPipe,
        SidebarModule,
        ButtonModule,
        RippleModule,
        DividerModule,
        AvatarModule,
        Menu
    ],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
    constructor(
        private userService: UserService,
        private menuService: MenuService
    ) {}

    user$ = this.userService.user$
    isLogged$ = this.userService.isLogged$
    isOpen = false

    login() {
        this.userService.login()
        this.setIsOpen(false)
    }

    logout() {
        this.userService.logout()
        this.setIsOpen(false)
    }

    setIsOpen = (isOpen: boolean) => {
        this.isOpen = isOpen
    }

    menuItems = this.menuService.getMenuItems()
    mobileAdminMenuItems = this.menuService.getAdminMenuItems()

    adminMenuItems: MenuItem[] = [
        {
            label: 'Mon profil',
            route: 'profil',
            icon: 'pi pi-user'
        },
        {
            separator: true
        },
        {
            label: 'Administration',
            route: 'admin',
            icon: 'pi pi-shield'
        },
        {
            label: 'Agent',
            route: 'agent',
            icon: 'pi pi-wrench'
        },
        {
            separator: true
        },
        {
            label: 'Déconnexion',
            command: this.logout.bind(this),
            icon: 'pi pi-sign-out'
        }
    ]

    userMenuItems: MenuItem[] = [
        {
            label: 'Mon profil',
            route: 'profil',
            icon: 'pi pi-user'
        },
        {
            separator: true
        },
        {
            label: 'Déconnexion',
            command: this.logout.bind(this),
            icon: 'pi pi-sign-out'
        }
    ]
}
