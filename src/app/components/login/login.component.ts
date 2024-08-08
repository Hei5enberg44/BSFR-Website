import { Component } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { AuthService } from '../../services/auth/auth.service'
import { ToastService } from '../../services/toast/toast.service'
import { HttpErrorResponse } from '@angular/common/http'
import { catchError, throwError } from 'rxjs'

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ProgressSpinnerModule],
    templateUrl: './login.component.html'
})
export class LoginComponent {
    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private authService: AuthService,
        private toastService: ToastService
    ) {}

    ngOnInit(): void {
        if (!this.authService.isLogged.getValue()) {
            const paramCode =
                this.activatedRoute.snapshot.queryParamMap.get('code')
            const paramState =
                this.activatedRoute.snapshot.queryParamMap.get('state')

            if (paramCode && paramState) {
                this.authService
                    .callback(paramCode, paramState)
                    .pipe(
                        catchError((error: HttpErrorResponse) => {
                            this.router.navigate(['home'])
                            return throwError(() => error)
                        })
                    )
                    .subscribe(() => {
                        const requestedRoute =
                            localStorage.getItem('requested_uri') ?? ''
                        this.router.navigate([requestedRoute])
                        localStorage.removeItem('requested_uri')
                        localStorage.removeItem('state')
                        this.toastService.showSuccess('Connexion réussie')
                    })
            } else {
                this.router.navigate(['home'])
                this.toastService.showError('Requête invalide')
            }
        } else {
            this.router.navigate(['home'])
        }
    }
}
