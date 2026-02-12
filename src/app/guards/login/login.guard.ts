import { inject } from '@angular/core'
import { CanActivateFn } from '@angular/router'
import { UserService } from '../../services/user/user.service'
import { Observable } from 'rxjs'

export const LoginGuard: CanActivateFn = (route, state) => {
    const userService = inject(UserService)

    return new Observable<boolean>((observer) => {
        userService.getUser().subscribe((user) => {
            userService.setUser(user)
            observer.next(true)
        })
    })
}
