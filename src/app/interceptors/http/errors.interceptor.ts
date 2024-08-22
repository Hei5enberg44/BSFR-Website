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
        catchError((errorResponse: HttpErrorResponse) => {
            const reqError = errorResponse.error
            if (!reqError?.message) {
                switch (errorResponse.status) {
                    case 500:
                        if (
                            errorResponse.statusText === 'Internal Server Error'
                        )
                            toastService.showError('Serveur injoignable')
                        else toastService.showError('Une erreur est survenue')
                        break
                    case 401:
                        userService.logout(false)
                        userService.login()
                        break
                }
            } else {
                switch (errorResponse.status) {
                    case 401:
                        userService.logout(false)
                        userService.login()
                        break
                    default:
                        toastService.showError(
                            reqError.message,
                            'Une erreur est survenue'
                        )
                }
            }
            return throwError(() => errorResponse)
        })
    )
}
