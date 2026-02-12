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
            path: '/accueil',
            icon: this.icons.home
        },
        {
            label: 'YouTube',
            path: '/youtube',
            icon: this.icons.youtube
        },
        {
            label: 'Carte interactive',
            path: '/carte-interactive',
            icon: this.icons.map
        }
    ]

    getMenuItems() {
        return this.menuItems
    }
}
