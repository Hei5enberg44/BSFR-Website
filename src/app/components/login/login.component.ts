import { Component } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { ProgressSpinnerModule } from 'primeng/progressspinner'
import { UserService } from '../../services/user/user.service'
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
        private userService: UserService,
        private toastService: ToastService
    ) {}

    ngOnInit(): void {
        if (!this.userService.isLogged.getValue()) {
            const paramCode =
                this.activatedRoute.snapshot.queryParamMap.get('code')
            const paramState =
                this.activatedRoute.snapshot.queryParamMap.get('state')

            if (paramCode && paramState) {
                this.userService
                    .callback(paramCode, paramState)
                    .pipe(
                        catchError((error: HttpErrorResponse) => {
                            this.router.navigate(['home'])
                            return throwError(() => error)
                        })
                    )
                    .subscribe(() => {
                        this.toastService.showSuccess('Connexion réussie')
                        const requestedRoute =
                            localStorage.getItem('requested_uri') ?? ''
                        this.router.navigate([requestedRoute])
                        localStorage.removeItem('requested_uri')
                        localStorage.removeItem('state')
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
