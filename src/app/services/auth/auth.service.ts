import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Router } from '@angular/router'
import { CookieService } from 'ngx-cookie-service'
import { UserService } from '../user/user.service'
import { ToastService } from '../toast/toast.service'
import { BehaviorSubject, Observable } from 'rxjs'

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(
        private http: HttpClient,
        private cookieService: CookieService,
        private userService: UserService,
        private toastService: ToastService,
        private router: Router
    ) {}

    public logged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        this.isLogged
    )
    logged$: Observable<boolean> = this.logged.asObservable()

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
        return this.http.post<{ sessionId: string }>('/api/discord/login', {
            code,
            state
        })
    }

    checkLogin() {
        return this.userService.getUser()
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
        this.userService.user.next(null)
        this.logged.next(false)
        this.router.navigate(['home'])
        this.toastService.showSuccess('Vous avez été déconnecté')
    }
}
