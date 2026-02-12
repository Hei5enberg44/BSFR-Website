import { inject } from '@angular/core'
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http'
import { catchError, throwError } from 'rxjs'
import { UserService } from '../../services/user/user.service'
import { ToastService } from '../../services/toast/toast.service'

export const HttpErrorsInterceptor: HttpInterceptorFn = (req, next) => {
    const userService = inject(UserService)
    const toastService = inject(ToastService)

    return next(req).pipe(
        catchError((errorResponse: HttpErrorResponse) => {
            const reqError = errorResponse.error
            switch (errorResponse.status) {
                case 401:
                    userService.logout(false)
                    userService.login()
                    break
                default:
                    toastService.showError(
                        reqError?.message ? reqError.message : 'Une erreur est survenue'
                    )
            }
            return throwError(() => errorResponse)
        })
    )
}
