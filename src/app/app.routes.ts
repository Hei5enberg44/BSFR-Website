import { Routes } from '@angular/router'
import { AccueilComponent } from './components/accueil/accueil.component'
import { RankedleComponent } from './components/rankedle/rankedle.component'

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
