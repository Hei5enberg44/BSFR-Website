import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Router } from '@angular/router'
import { UserService } from '../user/user.service'
import { ToastService } from '../toast/toast.service'
import { BehaviorSubject, Observable } from 'rxjs'

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(
        private http: HttpClient,
        private userService: UserService,
        private toastService: ToastService,
        private router: Router
    ) {}

    public isLogged: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
        false
    )
    isLogged$: Observable<boolean> = this.isLogged.asObservable()

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
            .get<{ authUrl: string }>('/api/discord/authorize', {
                params: new HttpParams().set('state', state)
            })
            .subscribe((res: { authUrl: string }) => {
                window.location.href = res.authUrl
            })
    }

    callback(code: string, state: string) {
        return this.http.post('/api/discord/login', {
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
        return this.http.post('/api/discord/logout', {}).subscribe(() => {
            this.userService.user.next(null)
            this.isLogged.next(false)
            this.router.navigate(['home'])
            this.toastService.showSuccess('Vous avez été déconnecté')
        })
    }
}
