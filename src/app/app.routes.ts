import { Routes } from '@angular/router'
import { AccueilComponent } from './components/accueil/accueil.component'
import { YouTubeComponent } from './components/youtube/youtube.component'
import { MultiPovComponent } from './components/multi-pov/multi-pov.component'
import { CarteInteractiveComponent } from './components/carte-interactive/carte-interactive.component'
import { FeurboardComponent } from './components/feurboard/feurboard.component'
import { RankedleComponent } from './components/rankedle/rankedle.component'

const title = 'Beat Saber FR'

export const routes: Routes = [
    {
        path: '',
        title: `Accueil • ${title}`,
        component: AccueilComponent
    },
    {
        path: 'youtube',
        title: `YouTube • ${title}`,
        component: YouTubeComponent
    },
    {
        path: 'multi-pov',
        title: `Multi POV • ${title}`,
        component: MultiPovComponent
    },
    {
        path: 'interactive-map',
        title: `Carte Interactive • ${title}`,
        component: CarteInteractiveComponent
    },
    {
        path: 'feurboard',
        title: `Feurboard • ${title}`,
        component: FeurboardComponent
    },
    {
        path: 'rankedle',
        title: `Rankedle • ${title}`,
        component: RankedleComponent
    }
]
