import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http'
import { catchError, throwError } from 'rxjs'
import { AuthService } from '../../services/auth/auth.service'
import { ToastService } from '../../services/toast/toast.service'

export const HttpErrorsInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router)
    const authService = inject(AuthService)
    const toastService = inject(ToastService)

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            const reqError = error.error
            if (!reqError?.error) {
                switch (error.status) {
                    case 500:
                        if (error.statusText === 'Internal Server Error')
                            toastService.showError('Serveur injoignable')
                        else toastService.showError('Une erreur est survenue')
                        break
                    case 401:
                        authService.logout()
                        toastService.showError('Session utilisateur invalide')
                        break
                }
            } else {
                switch (error.status) {
                    case 500:
                        toastService.showError(reqError.error)
                        break
                    case 401:
                        authService.logout()
                        toastService.showError(reqError.error)
                        break
                }
            }
            return throwError(() => error)
        })
    )
}
