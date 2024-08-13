import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Router } from '@angular/router'
import { ToastService } from '../toast/toast.service'
import { BehaviorSubject, Observable } from 'rxjs'

export interface User {
    id: string
    username: string
    avatarURL: string
    isBSFR: boolean
    isAdmin: boolean
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
    id: number
    name: string
}

export interface UserTwitchChannel {
    name: string
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(
        private http: HttpClient,
        private toastService: ToastService,
        private router: Router
    ) {}

    public user: BehaviorSubject<User | null> =
        new BehaviorSubject<User | null>(null)
    user$: Observable<User | null> = this.user.asObservable()

    public isLogged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false
    )
    isLogged$: Observable<boolean> = this.isLogged.asObservable()

    // Authentification
    private getState() {
        const validChars =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        let array = new Uint8Array(64)
        window.crypto.getRandomValues(array)
        const random = Array.from(
            array.map((x) => validChars.charCodeAt(x % validChars.length))
        )
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

    logout() {
        return this.http.post('/api/user/logout', {}).subscribe(() => {
            this.user.next(null)
            this.isLogged.next(false)
            this.router.navigate(['home'])
            this.toastService.showSuccess('Vous avez été déconnecté')
        })
    }

    // Récupère l'utilisateur connecté
    getUser() {
        return this.http.get<User | null>('/api/user/@me')
    }

    // Récupère la date de naissance de l'utilisateur
    getBirthday() {
        return this.http.get<{ date: Date | null }>('/api/user/getBirthday')
    }

    // Enregistre la date de naissance de l'utilisateur
    setBirthday(date: Date | null) {
        return this.http.post(
            '/api/user/setBirthday',
            { date },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
    }

    // Récupère les rôles de l'utilisateur
    getRoles() {
        return this.http.get<UserRoleCategory[]>('/api/user/getRoles')
    }

    // Enregistre les rôles de l'utilisateur
    setRoles(roles: string[]) {
        return this.http.post(
            '/api/user/setRoles',
            { roles },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
    }

    getCity() {
        return this.http.get<City>('/api/user/getCity')
    }

    // Enregistre la ville de l'utilisateur
    setCity(city: City | null) {
        return this.http.post(
            '/api/user/setCity',
            { city },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
    }

    searchCity(s: string) {
        return this.http.get<City[]>('/api/user/searchCity', {
            params: {
                s
            }
        })
    }

    getTwitchChannel() {
        return this.http.get<UserTwitchChannel | null>('/api/user/getTwitchChannel')
    }

    setTwitchChannel(channelName: string | null) {
        return this.http.post(
            '/api/user/setTwitchChannel',
            { channelName },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
    }
}
