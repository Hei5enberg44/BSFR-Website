import { Routes, UrlSegment } from '@angular/router'
import { LoginComponent } from './components/login/login.component'
import { AccueilComponent } from './components/accueil/accueil.component'
import { YouTubeComponent } from './components/youtube/youtube.component'
import { CarteInteractiveComponent } from './components/carte-interactive/carte-interactive.component'
import { RankedleComponent } from './components/rankedle/rankedle.component'
import { RankedleJeuComponent } from './components/rankedle/jeu/jeu.component'
import { RankedleClassementComponent } from './components/rankedle/classement/classement.component'
import { RankedleStatistiquesComponent } from './components/rankedle/statistiques/statistiques.component'
import { RankedleHistoriqueComponent } from './components/rankedle/historique/historique.component'
import { RankedleAideComponent } from './components/rankedle/aide/aide.component'
import { ProfilComponent } from './components/profil/profil.component'
import { ProfilAnniversaireComponent } from './components/profil/anniversaire/anniversaire.component'
import { ProfilRolesComponent } from './components/profil/roles/roles.component'
import { ProfilVilleComponent } from './components/profil/ville/ville.component'
import { ProfilTwitchComponent } from './components/profil/twitch/twitch.component'
import { ProfilCarteCubeStalkerComponent } from './components/profil/carte-cube-stalker/carte-cube-stalker.component'
import { AdminComponent } from './components/admin/admin.component'
import { AdminAnniversairesComponent } from './components/admin/anniversaires/anniversaires.component'
import { AdminMutesComponent } from './components/admin/mutes/mutes.component'
import { AdminBansComponent } from './components/admin/bans/bans.component'
import { AdminMessagesAnniversaireComponent } from './components/admin/messages-anniversaire/messages-anniversaire.component'
import { AdminTwitchComponent } from './components/admin/twitch/twitch.component'
import { AdminCubeStalkerComponent } from './components/admin/cube-stalker/cube-stalker.component'
import { AdminCubeStalkerRequestComponent } from './components/admin/cube-stalker/request/request.component'
import { PageNotFoundComponent } from './components/errors/page-not-found/page-not-found.component'
import { UnauthorizedComponent } from './components/errors/unauthorized/unauthorized.component'

import { AuthGuard } from './guards/auth/auth.guard'
import { LoginGuard } from './guards/login/login.guard'
import { AdminGuard } from './guards/admin/admin.guard'

const title = 'Beat Saber FR'

export const routes: Routes = [
    {
        path: 'login',
        title: `Connexion • ${title}`,
        component: LoginComponent,
        canActivate: [LoginGuard]
    },
    {
        path: '',
        redirectTo: 'accueil',
        pathMatch: 'full'
    },
    {
        path: 'accueil',
        title: `Accueil • ${title}`,
        component: AccueilComponent,
        canActivate: [LoginGuard]
    },
    {
        path: 'youtube',
        title: `YouTube • ${title}`,
        component: YouTubeComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'carte-interactive',
        title: `Carte Interactive • ${title}`,
        component: CarteInteractiveComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'rankedle',
        title: `Rankedle • ${title}`,
        component: RankedleComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: 'jeu',
                pathMatch: 'full'
            },
            {
                path: 'jeu',
                component: RankedleJeuComponent
            },
            {
                path: 'classement',
                component: RankedleClassementComponent
            },
            {
                path: 'statistiques',
                component: RankedleStatistiquesComponent
            },
            {
                path: 'historique',
                component: RankedleHistoriqueComponent
            },
            {
                path: 'aide',
                component: RankedleAideComponent
            }
        ]
    },
    {
        path: 'profil',
        title: `Mon profil • ${title}`,
        component: ProfilComponent,
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: 'anniversaire',
                pathMatch: 'full'
            },
            {
                path: 'anniversaire',
                component: ProfilAnniversaireComponent
            },
            {
                path: 'roles',
                component: ProfilRolesComponent
            },
            {
                path: 'ville',
                component: ProfilVilleComponent
            },
            {
                path: 'twitch',
                component: ProfilTwitchComponent
            },
            {
                path: 'cube-stalker',
                component: ProfilCarteCubeStalkerComponent
            }
        ]
    },
    {
        path: 'admin',
        title: `Administration • ${title}`,
        component: AdminComponent,
        canActivate: [AdminGuard],
        children: [
            {
                path: '',
                redirectTo: 'anniversaires',
                pathMatch: 'full'
            },
            {
                path: 'anniversaires',
                component: AdminAnniversairesComponent
            },
            {
                path: 'mutes',
                component: AdminMutesComponent
            },
            {
                path: 'bans',
                component: AdminBansComponent
            },
            {
                path: 'twitch',
                component: AdminTwitchComponent
            },
            {
                path: 'messages-anniversaire',
                component: AdminMessagesAnniversaireComponent
            },
            {
                path: 'cube-stalker',
                component: AdminCubeStalkerComponent
            },
            {
                matcher: (url) => {
                    if (
                        url.length === 2 &&
                        url[0].path === 'cube-stalker' &&
                        url[1].path.match(/^[0-9]+$/)
                    ) {
                        return {
                            consumed: url,
                            posParams: { id: new UrlSegment(url[1].path, {}) }
                        }
                    }
                    return null
                },
                component: AdminCubeStalkerRequestComponent
            }
        ]
    },
    {
        path: '403',
        component: UnauthorizedComponent,
        canActivate: [LoginGuard]
    },
    {
        path: '404',
        component: PageNotFoundComponent,
        canActivate: [LoginGuard]
    },
    {
        path: '**',
        redirectTo: '404'
    }
]
