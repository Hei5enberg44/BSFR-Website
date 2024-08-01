import { Component } from '@angular/core'
import { NgIf } from '@angular/common'
import { CardModule } from 'primeng/card'
import { MapService, MemberCity } from '../../services/map/map.service'
import { MapOptions, Marker, Icon, icon, latLng, marker } from 'leaflet'
import { LeafletModule } from '@asymmetrik/ngx-leaflet'
import * as esri from 'esri-leaflet-vector'

import { NotBsfrMemberComponent } from '../not-bsfr-member/not-bsfr-member.component'
import { UserService } from '../../services/user/user.service'

interface PopupData {
    coords: string
    countryName: string
    cityName: string
    users: {
        username: string
        avatar: string
    }[]
}

@Component({
    selector: 'app-carteinteractive',
    standalone: true,
    imports: [NgIf, CardModule, LeafletModule, NotBsfrMemberComponent],
    templateUrl: './carte-interactive.component.html',
    styleUrl: './carte-interactive.component.scss'
})
export class CarteInteractiveComponent {
    isBSFR: boolean = false

    constructor(
        private userService: UserService,
        private mapService: MapService
    ) {
        this.userService.user$.subscribe((user) => {
            this.isBSFR = user?.isBSFR ?? false
        })
    }

    layer = esri.vectorBasemapLayer('arcgis/navigation', {
        apikey: 'AAPKbd80a71eb7694e0cad9f29fea06b27b7YKFdaFPfA5lECHP8_qvqG5b0eyJW4TbpP5ndaM1QvNkj1Oya5z9Oxx5ShArwhraE',
        language: 'fr'
    })

    options: MapOptions = {
        layers: [this.layer],
        zoom: 5.75,
        center: latLng(47, 2)
    }

    markers: Marker<any>[] = []

    ngOnInit(): void {
        this.mapService.getMembersCity().subscribe((membersCity) => {
            this.createPopups(membersCity)
        })
    }

    createPopups(membersCity: MemberCity[]) {
        const popups: PopupData[] = []
        for (const city of membersCity) {
            const p = popups.find(
                (p) =>
                    p.countryName === city.countryName &&
                    p.cityName === city.cityName &&
                    p.coords === city.coords
            )

            if (!p) {
                popups.push({
                    coords: city.coords,
                    countryName: city.countryName,
                    cityName: city.cityName,
                    users: [
                        {
                            username: city.username,
                            avatar: city.avatarURL
                        }
                    ]
                })
            } else {
                p.users.push({
                    username: city.username,
                    avatar: city.avatarURL
                })
            }
        }

        for(const p of popups) {
            const coords = p.coords.split(',')
            const m = marker({ lat: parseFloat(coords[0]), lng: parseFloat(coords[1]) }, {
                icon: icon({
                    ...Icon.Default.prototype.options,
                    iconUrl: 'assets/marker-icon.png',
                    iconRetinaUrl: 'assets/marker-icon-2x.png',
                    shadowUrl: 'assets/marker-shadow.png'
                })
            })
    
            const popupUsers = []
            for(const u of p.users) {
                popupUsers.push(`<table><tbody><tr><td><span class="block bg-cover w-12 h-12 me-2 rounded-full" style="background-image: url(${u.avatar})"></span></td><td><b>${u.username}</b><br>${p.cityName} (${p.countryName})</td></tr></tbody></table>`)
            }
            m.bindPopup(popupUsers.join('<hr class="my-2">'))
            this.markers.push(m)
        }
    }
}
