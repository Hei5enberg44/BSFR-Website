import { inject } from '@angular/core'
import { CanActivateFn } from '@angular/router'
import { UserService } from '../../services/user/user.service'
import { AuthService } from '../../services/auth/auth.service'
import { Observable } from 'rxjs'

export const LoginGuard: CanActivateFn = (route, state) => {
    const userService = inject(UserService)
    const authService = inject(AuthService)

    if (authService.isLogged) {
        return new Observable<boolean>((observer) => {
            authService.checkLogin().subscribe((res) => {
                userService.user.next(res)
                authService.logged.next(true)
                observer.next(true)
            })
        })
    } else {
        return true
    }
}
