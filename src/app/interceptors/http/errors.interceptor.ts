import { inject } from '@angular/core'
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http'
import { catchError, throwError } from 'rxjs'
import { AuthService } from '../../services/auth/auth.service'
import { ToastService } from '../../services/toast/toast.service'

export const HttpErrorsInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService)
    const toastService = inject(ToastService)

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            const reqError = error.error
            switch (error.status) {
                case 500:
                    if (reqError?.error) toastService.showError(reqError.error)
                    break
                case 401:
                    authService.logout()
                    if (reqError?.error) toastService.showError(reqError.error)
                    break
            }
            return throwError(() => error)
        })
    )
}
