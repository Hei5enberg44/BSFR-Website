import { inject } from '@angular/core'
import { CanActivateFn } from '@angular/router'
import { UserService } from '../../services/user/user.service'
import { AuthService } from '../../services/auth/auth.service'
import { Observable } from 'rxjs'

export const LoginGuard: CanActivateFn = (route, state) => {
    const userService = inject(UserService)
    const authService = inject(AuthService)

    return new Observable<boolean>((observer) => {
        userService.getUser().subscribe((user) => {
            userService.user.next(user)
            authService.isLogged.next(user !== null)
            observer.next(true)
        })
    })
}
