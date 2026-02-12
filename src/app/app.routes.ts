import { Routes, UrlSegment } from '@angular/router'
import { LoginComponent } from './components/login/login.component'
import { AccueilComponent } from './components/accueil/accueil.component'
import { YouTubeComponent } from './components/youtube/youtube.component'
import { CarteInteractiveComponent } from './components/carte-interactive/carte-interactive.component'
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
import { AgentComponent } from './components/agent/agent.component'
import { AgentMessageComponent } from './components/agent/message/message.component'
import { AgentReactionComponent } from './components/agent/reaction/reaction.component'
import { AgentSettingsComponent } from './components/agent/settings/settings.component'
import { PageNotFoundComponent } from './components/errors/page-not-found/page-not-found.component'
import { UnauthorizedComponent } from './components/errors/unauthorized/unauthorized.component'
import { NotBsfrMemberComponent } from './components/errors/not-bsfr-member/not-bsfr-member.component'

import { AuthGuard } from './guards/auth/auth.guard'
import { LoginGuard } from './guards/login/login.guard'
import { AdminGuard } from './guards/admin/admin.guard'

const title = 'Beat Saber FR'

export const routes: Routes = [
    {
        path: 'login',
        title: `Connexion • ${title}`,
        component: LoginComponent
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
                            posParams: { requestId: new UrlSegment(url[1].path, {}) }
                        }
                    }
                    return null
                },
                component: AdminCubeStalkerRequestComponent
            }
        ]
    },
    {
        path: 'agent',
        title: `Agent • ${title}`,
        component: AgentComponent,
        canActivate: [AdminGuard],
        children: [
            {
                path: '',
                redirectTo: 'message',
                pathMatch: 'full'
            },
            {
                path: 'message',
                component: AgentMessageComponent
            },
            {
                path: 'reaction',
                component: AgentReactionComponent
            },
            {
                path: 'parametres',
                component: AgentSettingsComponent
            }
        ]
    },
    {
        path: 'rejoignez-nous',
        component: NotBsfrMemberComponent,
        canActivate: [LoginGuard]
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
