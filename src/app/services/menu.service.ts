import { Injectable } from '@angular/core'
import feather from 'feather-icons'

@Injectable({
    providedIn: 'root'
})
export class MenuService {
    constructor() {}

    private icons = {
        home: feather.icons.home,
        youtube: feather.icons.youtube,
        film: feather.icons.film,
        map: feather.icons['map-pin'],
        scissors: feather.icons.scissors,
        music: feather.icons.music
    }

    private menuItems = [
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

    getMenuItems() {
        return this.menuItems
    }
}
