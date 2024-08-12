import { inject } from '@angular/core'
import { CanActivateFn } from '@angular/router'
import { UserService } from '../../services/user/user.service'
import { Observable } from 'rxjs'

export const AuthGuard: CanActivateFn = (route, state) => {
    const userService = inject(UserService)

    return new Observable<boolean>((observer) => {
        userService.getUser().subscribe((user) => {
            if (user === null) {
                localStorage.setItem('requested_uri', route.url.toString())
                userService.authorize()
                observer.next(false)
            } else {
                userService.user.next(user)
                userService.isLogged.next(user !== null)
                observer.next(true)
            }
        })
    })
}
