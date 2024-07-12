import { Routes } from '@angular/router'
import { LoginComponent } from './components/login/login.component'
import { AccueilComponent } from './components/accueil/accueil.component'
import { YouTubeComponent } from './components/youtube/youtube.component'
import { CarteInteractiveComponent } from './components/carte-interactive/carte-interactive.component'
import { RankedleComponent } from './components/rankedle/rankedle.component'

import { AuthGuard } from './guards/auth/auth.guard'
import { LoginGuard } from './guards/login/login.guard'

const title = 'Beat Saber FR'

export const routes: Routes = [
    {
        path: 'login',
        title: `Connexion • ${title}`,
        component: LoginComponent
    },
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        title: `Accueil • ${title}`,
        component: AccueilComponent,
        canActivate: [LoginGuard]
    },
    {
        path: 'youtube',
        title: `YouTube • ${title}`,
        component: YouTubeComponent,
        canActivate: [AuthGuard, LoginGuard]
    },
    {
        path: 'interactive-map',
        title: `Carte Interactive • ${title}`,
        component: CarteInteractiveComponent,
        canActivate: [AuthGuard, LoginGuard]
    },
    {
        path: 'rankedle',
        title: `Rankedle • ${title}`,
        component: RankedleComponent,
        canActivate: [AuthGuard, LoginGuard]
    }
]