import { inject } from '@angular/core'
import { Router } from '@angular/router'
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http'
import { catchError, throwError } from 'rxjs'
import { UserService } from '../../services/user/user.service'
import { ToastService } from '../../services/toast/toast.service'

export const HttpErrorsInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router)
    const userService = inject(UserService)
    const toastService = inject(ToastService)

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            const reqError = error.error
            if (!reqError?.message) {
                switch (error.status) {
                    case 500:
                        if (error.statusText === 'Internal Server Error')
                            toastService.showError('Serveur injoignable')
                        else toastService.showError('Une erreur est survenue')
                        break
                    case 401:
                        userService.logout()
                        toastService.showError('Session utilisateur invalide')
                        break
                }
            } else {
                switch (error.status) {
                    case 500:
                        toastService.showError(reqError.message)
                        break
                    case 401:
                        userService.logout()
                        toastService.showError(reqError.message)
                        break
                }
            }
            return throwError(() => error)
        })
    )
}
