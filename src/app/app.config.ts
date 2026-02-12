import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core'
import { provideRouter, withComponentInputBinding } from '@angular/router'

import { providePrimeNG } from 'primeng/config'
import { definePreset } from '@primeuix/themes'
import Midnight from './themes/midnight'
import { ConfirmationService, MessageService } from 'primeng/api'

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http'
import { HttpErrorsInterceptor } from './interceptors/http/errors.interceptor'

import { provideTranslateService } from '@ngx-translate/core'
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader'

import { routes } from './app.routes'

const MidnightPreset = definePreset(Midnight, {
    semantic: {
        colorScheme: {
            dark: {
                background: '#00224D'
            }
        }
    }
})

export const appConfig: ApplicationConfig = {
    providers: [
        ConfirmationService,
        MessageService,
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes, withComponentInputBinding()),
        providePrimeNG({
            theme: {
                preset: MidnightPreset,
                options: {
                    cssLayer: {
                        name: 'primeng',
                        order: 'theme, base, primeng'
                    },
                    prefix: 'p',
                    darkModeSelector: '.p-dark'
                }
            },
            csp: {
                nonce: 'NGINX_CSP_NONCE'
            }
        }),
        provideHttpClient(withFetch(), withInterceptors([HttpErrorsInterceptor])),
        provideTranslateService({
            loader: provideTranslateHttpLoader({
                prefix: '/i18n/',
                suffix: '.json'
            }),
            fallbackLang: 'fr',
            lang: 'fr'
        })
    ]
}
