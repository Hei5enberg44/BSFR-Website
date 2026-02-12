import { Injectable, signal } from '@angular/core'
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http'
import { Router } from '@angular/router'
import { ToastService } from '../toast/toast.service'

export interface User {
    id: string
    username: string
    avatarURL: string
    isBSFR: boolean
    isAdmin: boolean
    isTeamYT: boolean
    isNitroBooster: boolean
}

interface Member {
    id: string
    name: string
    avatar: string
}

export interface UserRole {
    id: number
    name: string
    multiple: boolean
    checked: boolean
}

export interface UserRoleCategory {
    categoryName: string
    roles: UserRole[]
}

export interface City {
    id: string
    name: string
}

export interface UserTwitchChannel {
    name: string
}

export interface UploadedFile extends File {
    objectURL: string
}

export enum MemberCardStatus {
    Preview = 0,
    Pending = 1,
    Approved = 2,
    Denied = 3
}

export interface CardPreview {
    member: Member
    preview: string
    status: MemberCardStatus
}

export type CardPreviewResponse = HttpResponse<CardPreview>

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(
        private http: HttpClient,
        private toastService: ToastService,
        private router: Router
    ) {}

    private readonly _user = signal<User | null>(null)
    private readonly _isLogged = signal(false)

    get user() {
        return this._user.asReadonly()
    }

    get isLogged() {
        return this._isLogged.asReadonly()
    }

    // Authentification
    private getState() {
        const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let array = new Uint8Array(64)
        window.crypto.getRandomValues(array)
        const random = Array.from(array.map((x) => validChars.charCodeAt(x % validChars.length)))
        const state = String.fromCharCode.apply(null, random)
        return state
    }

    authorize() {
        const state = this.getState()
        localStorage.setItem('state', state)

        this.http
            .get<{ authUrl: string }>('/api/user/authorize', {
                params: new HttpParams().set('state', state)
            })
            .subscribe((res: { authUrl: string }) => {
                window.location.href = res.authUrl
            })
    }

    callback(code: string, state: string) {
        return this.http.post('/api/user/login', {
            code,
            state
        })
    }

    login() {
        const requestedRoute = this.router.url.toString()
        localStorage.setItem('requested_uri', requestedRoute)
        this.authorize()
    }

    logout(redirect: boolean = true) {
        return this.http.post('/api/user/logout', {}).subscribe(() => {
            this._user.set(null)
            this._isLogged.set(false)
            if (redirect) {
                this.router.navigate(['accueil'])
                this.toastService.showSuccess('Vous avez été déconnecté')
            }
        })
    }

    setUser(user: User | null) {
        this._user.set(user)
        this._isLogged.set(user !== null)
    }

    // Récupère l'utilisateur connecté
    getUser() {
        return this.http.get<User | null>('/api/user/@me', {
            headers: {
                'Accept': 'application/json'
            }
        })
    }

    // Récupère la date de naissance de l'utilisateur
    getBirthday() {
        return this.http.get<{ date: Date | null }>('/api/user/birthday', {
            headers: {
                'Accept': 'application/json'
            }
        })
    }

    // Enregistre la date de naissance de l'utilisateur
    setBirthday(date: Date | null) {
        return this.http.post('/api/user/birthday', { date }, {
            headers: {
                'Accept': 'application/json'
            }
        })
    }

    // Récupère les rôles de l'utilisateur
    getRoles() {
        return this.http.get<UserRoleCategory[]>('/api/user/roles', {
            headers: {
                'Accept': 'application/json'
            }
        })
    }

    // Enregistre les rôles de l'utilisateur
    setRoles(roles: string[]) {
        return this.http.post('/api/user/roles', { roles })
    }

    getCity() {
        return this.http.get<City>('/api/user/city', {
            headers: {
                'Accept': 'application/json'
            }
        })
    }

    // Enregistre la ville de l'utilisateur
    setCity(city: City | null) {
        return this.http.post('/api/user/city', { city })
    }

    searchCity(s: string) {
        return this.http.get<City[]>('/api/user/searchCity', {
            headers: {
                'Accept': 'application/json'
            },
            params: {
                s
            }
        })
    }

    getTwitchChannel() {
        return this.http.get<UserTwitchChannel | null>('/api/user/twitchChannel', {
            headers: {
                'Accept': 'application/json'
            }
        })
    }

    setTwitchChannel(channelName: string | null) {
        return this.http.post('/api/user/twitchChannel', { channelName })
    }

    getCardPreview(memberId?: string) {
        return this.http.get<CardPreview>('/api/user/cardPreview', {
            headers: {
                'Accept': 'application/json'
            },
            params: memberId
                ? {
                      memberId
                  }
                : {}
        })
    }

    setCard() {
        return this.http.post('/api/user/card', null)
    }

    removeCard() {
        return this.http.delete('/api/user/card')
    }
}
