import { inject } from '@angular/core'
import { CanActivateFn } from '@angular/router'
import { AuthService } from '../../services/auth/auth.service'
import { Observable } from 'rxjs'

export const AuthGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService)

    return new Observable<boolean>((observer) => {
        if (authService.isLogged !== true) {
            localStorage.setItem('requested_uri', route.url.toString())
            authService.authorize()
            observer.next(false)
        } else {
            observer.next(true)
        }
    })
}
