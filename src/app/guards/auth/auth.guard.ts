import { inject } from '@angular/core'
import { CanActivateFn } from '@angular/router'
import { AuthService } from '../../services/auth/auth.service'
import { UserService } from '../../services/user/user.service'
import { Observable } from 'rxjs'

export const AuthGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService)
    const userService = inject(UserService)

    return new Observable<boolean>((observer) => {
        userService.getUser().subscribe((user) => {
            if (user === null) {
                localStorage.setItem('requested_uri', route.url.toString())
                authService.authorize()
                observer.next(false)
            } else {
                observer.next(true)
            }
        })
    })
}
