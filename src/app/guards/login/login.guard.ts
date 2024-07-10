import { Injectable } from '@angular/core'
import {
    ActivatedRoute,
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot
} from '@angular/router'
import { Observable } from 'rxjs'
import { AuthService } from '../../services/auth/auth.service'
import { ToastService } from '../../services/toast/toast.service'

@Injectable({
    providedIn: 'root'
})
export class LoginGuard implements CanActivate {
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private authService: AuthService,
        private toastService: ToastService
    ) {}
    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        if (!this.authService.isLogged) {
            const paramCode = next.queryParamMap.get('code')
            const paramState = next.queryParamMap.get('state')

            if (paramCode && paramState) {
                this.authService.callback(paramCode, paramState)
            } else {
                this.router.navigate([''])
                this.toastService.showError(
                    "Problème d'authentification à Discord"
                )
            }
        } else {
            this.router.navigate([''])
        }
        return false
    }
}
