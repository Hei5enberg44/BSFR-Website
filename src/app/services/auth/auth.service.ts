import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Router, ActivatedRoute } from '@angular/router'
import { CookieService } from 'ngx-cookie-service'
import { ToastService } from '../toast/toast.service'
import { BehaviorSubject, Observable } from 'rxjs'

interface User {
    id: string
    username: string
    avatarURL: string
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(
        private http: HttpClient,
        private cookieService: CookieService,
        private activatedRoute: ActivatedRoute,
        private toastService: ToastService,
        private router: Router
    ) {}

    private user: BehaviorSubject<User | null> =
        new BehaviorSubject<User | null>(null)
    user$: Observable<User | null> = this.user.asObservable()

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

    getSessionId() {
        return this.cookieService.get('sessionId')
    }

    setSessionId(sessionId: string) {
        this.cookieService.set('sessionId', sessionId)
    }

    removeSessionId() {
        this.cookieService.delete('sessionId')
    }

    authorize() {
        const state = this.getState()
        localStorage.setItem('state', state)

        this.http
            .get<{ authUrl: string }>('/api/discord/authorize', {
                params: new HttpParams().set('state', state)
            })
            .subscribe((res: { authUrl: string }) => {
                window.location.href = res.authUrl
            })
    }

    callback(code: string, state: string) {
        this.http
            .post<{ sessionId: string }>(
                '/api/discord/login',
                {
                    code,
                    state
                }
            )
            .subscribe((res) => {
                this.setSessionId(res.sessionId)
                const requestedRoute =
                    localStorage.getItem('requested_uri') ?? ''
                this.router.navigate([requestedRoute])
                this.check()
                this.toastService.showSuccess('Connexion réussie')
                localStorage.removeItem('requested_uri')
                localStorage.removeItem('state')
            })
    }

    check() {
        if (this.isLogged) {
            this.http.get<User>('/api/discord/@me').subscribe((res) => {
                this.user.next(res)
            })
        }
    }

    get isLogged(): boolean {
        return this.getSessionId() !== ''
    }

    login() {
        const requestedRoute = this.router.url.toString()
        localStorage.setItem('requested_uri', requestedRoute)

        this.authorize()
    }

    logout() {
        this.removeSessionId()
        this.user.next(null)
        this.router.navigate(['home'])
        this.toastService.showSuccess('Vous avez été déconnecté')
    }
}
