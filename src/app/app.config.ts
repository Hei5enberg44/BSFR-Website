import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { provideRouter } from '@angular/router'
import {
    provideHttpClient,
    withFetch,
    withInterceptors
} from '@angular/common/http'
import { HttpErrorsInterceptor } from './interceptors/http/errors.interceptor'

import { routes } from './app.routes'
import { MessageService } from 'primeng/api'

export const appConfig: ApplicationConfig = {
    providers: [
        MessageService,
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideAnimations(),
        provideHttpClient(
            withFetch(),
            withInterceptors([HttpErrorsInterceptor])
        )
    ]
}
