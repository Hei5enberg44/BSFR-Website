import { Routes } from '@angular/router'
import { AccueilComponent } from './Components/Accueil/accueil.component'
import { RankedleComponent } from './Components/Rankedle/rankedle.component'

const title = 'Beat Saber FR'

export const routes: Routes = [
    {
        path: '',
        title: `Accueil • ${title}`,
        component: AccueilComponent
    },
    {
        path: 'rankedle',
        title: `Rankedle • ${title}`,
        component: RankedleComponent
    }
]
