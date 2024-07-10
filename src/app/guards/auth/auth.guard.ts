import { Injectable } from '@angular/core'
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot
} from '@angular/router'
import { Observable } from 'rxjs'
import { AuthService } from '../../services/auth/auth.service'

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(
        public authService: AuthService,
        public router: Router
    ) {}
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        if (this.authService.isLogged !== true) {
            const requestedRoute = next.url.toString()
            localStorage.setItem('requested_uri', requestedRoute)

            this.authService.authorize()
            return false
        } else {
            return true
        }
    }
}
