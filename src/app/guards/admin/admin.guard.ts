import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { UserService } from '../../services/user/user.service'
import { Observable } from 'rxjs'

export const AdminGuard: CanActivateFn = (route, state) => {
    const userService = inject(UserService)
    const router = inject(Router)

    return new Observable<boolean>((observer) => {
        userService.getUser().subscribe((user) => {
            if (user === null) {
                localStorage.setItem('requested_uri', route.url.toString())
                userService.authorize()
                observer.next(false)
            } else {
                userService.setUser(user)

                if (!user.isAdmin) {
                    router.navigate(['403'])
                    observer.next(false)
                } else {
                    observer.next(true)
                }
            }
        })
    })
}
