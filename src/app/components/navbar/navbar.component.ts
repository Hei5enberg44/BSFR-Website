import { Component, effect, inject, signal } from '@angular/core'
import { RouterModule } from '@angular/router'
import { DrawerModule } from 'primeng/drawer'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import { DividerModule } from 'primeng/divider'
import { AvatarModule } from 'primeng/avatar'
import { Menu } from 'primeng/menu'
import { MenuItem } from 'primeng/api'
import { UserService } from '../../services/user/user.service'
import { MenuService } from '../../services/menu/menu.service'
import { svgPipe } from '../../pipes/svg.pipe'
import feather from 'feather-icons'

@Component({
    selector: 'app-navbar',
    imports: [
        RouterModule,
        svgPipe,
        DrawerModule,
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
    userService = inject(UserService)
    menuService = inject(MenuService)

    constructor() {
        effect(() => {
            this.updateUserMenu()
        })
    }

    user = this.userService.user
    isLogged = this.userService.isLogged
    isOpen = signal(false)

    login() {
        this.userService.login()
        this.setIsOpen(false)
    }

    logout() {
        this.userService.logout()
        this.setIsOpen(false)
    }

    setIsOpen = (isOpen: boolean) => {
        this.isOpen.set(isOpen)
    }

    private icons = {
        home: feather.icons.home,
        youtube: feather.icons.youtube,
        film: feather.icons.film,
        map: feather.icons['map-pin'],
        scissors: feather.icons.scissors,
        music: feather.icons.music
    }

    menuItems = this.menuService.getMenuItems()

    private adminUserMenuItems: MenuItem[] = [
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
        }
    ]

    userMenuItems: MenuItem[] = []

    private mobileAdminUserMenuItems: (MenuItem & { path: string })[] = [
        {
            label: 'Admininistration',
            path: 'admin',
            icon: 'pi pi-shield'
        },
        {
            label: 'Agent',
            path: 'agent',
            icon: 'pi pi-wrench'
        }
    ]

    mobileUserMenuItems: (MenuItem & { path: string })[] = []

    updateUserMenu() {
        const user = this.user()
        if (user) {
            this.userMenuItems = [
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

            this.mobileUserMenuItems = []

            if (user?.isAdmin) {
                this.userMenuItems.splice(2, 0, ...this.adminUserMenuItems)
                this.mobileUserMenuItems.push(...this.mobileAdminUserMenuItems)
            }
            if (user?.isTeamYT) {
                this.userMenuItems.splice(
                    2,
                    0,
                    ...[
                        {
                            label: 'Vote run BSFR',
                            route: 'vote-run',
                            icon: 'pi pi-video'
                        },
                        {
                            separator: true
                        }
                    ]
                )
                this.mobileUserMenuItems.splice(0, 0, {
                    label: 'Vote run BSFR',
                    path: 'vote-run',
                    icon: 'pi pi-video'
                })
            }
        }
    }
}
