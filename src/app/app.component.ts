import { Component, OnInit } from '@angular/core'
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router'
import { PrimeNGConfig } from 'primeng/api'
import { SidebarModule } from 'primeng/sidebar'
import { ButtonModule } from 'primeng/button'
import { RippleModule } from 'primeng/ripple'
import feather from 'feather-icons'
import { svgPipe } from './Pipes/svg.pipe'

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterLink,
        RouterLinkActive,
        RouterOutlet,
        SidebarModule,
        ButtonModule,
        RippleModule,
        svgPipe
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
    constructor(private primengConfig: PrimeNGConfig) {}

    ngOnInit(): void {
        this.primengConfig.ripple = true
    }

    isOpen = false

    setIsOpen = (isOpen: boolean) => {
        this.isOpen = isOpen
    }

    icons = {
        home: feather.icons.home,
        youtube: feather.icons.youtube,
        film: feather.icons.film,
        map: feather.icons['map-pin'],
        scissors: feather.icons.scissors,
        music: feather.icons.music
    }

    menuItems = [
        {
            label: 'Accueil',
            path: '/',
            icon: feather.icons.home
        },
        {
            label: 'YouTube',
            path: '/youtube',
            icon: feather.icons.youtube
        },
        {
            label: 'Multi POV',
            path: '/mutli-pov',
            icon: feather.icons.film
        },
        {
            label: 'Carte interactive',
            path: '/map',
            icon: feather.icons['map-pin']
        },
        {
            label: 'Feurboard',
            path: '/feurboard',
            icon: feather.icons.scissors
        },
        {
            label: 'Rankedle',
            path: '/rankedle',
            icon: feather.icons.music
        }
    ]

    menuItemLink = 'p-ripple p-element no-underline text-white flex items-center cursor-pointer p-3 rounded-md hover:bg-[var(--surface-100)] transition-duration-150 transition-colors'
    menuItemLinkActive = 'p-ripple p-element no-underline text-white flex items-center cursor-pointer p-3 rounded-md bg-[var(--primary-600)] hover:bg-[var(--primary-500)] transition-duration-150 transition-colors'

    logged = false
}
