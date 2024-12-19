import {
    ApplicationConfig,
    provideZoneChangeDetection,
    importProvidersFrom
} from '@angular/core'
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'
import { provideRouter, withComponentInputBinding } from '@angular/router'
import {
    HttpClient,
    provideHttpClient,
    withFetch,
    withInterceptors
} from '@angular/common/http'
import { HttpErrorsInterceptor } from './interceptors/http/errors.interceptor'

import { routes } from './app.routes'
import { providePrimeNG } from 'primeng/config'
import { definePreset } from '@primeng/themes'
import Aura from '@primeng/themes/aura'
import { ConfirmationService, MessageService } from 'primeng/api'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'
import { IMAGE_CONFIG } from '@angular/common'

function HttpLoaderFactory(http: HttpClient) {
    return new TranslateHttpLoader(http, './i18n/', '.json')
}

export const provideTranslation = () => ({
    loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
    }
})

const AuraBlue = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}'
        }
    }
})

export const appConfig: ApplicationConfig = {
    providers: [
        MessageService,
        ConfirmationService,
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes, withComponentInputBinding()),
        provideAnimationsAsync(),
        providePrimeNG({
            theme: {
                preset: AuraBlue,
                options: {
                    cssLayer: {
                        name: 'primeng',
                        order: 'tailwind-base, primeng, tailwind-utilities'
                    }
                }
            }
        }),
        provideHttpClient(
            withFetch(),
            withInterceptors([HttpErrorsInterceptor])
        ),
        importProvidersFrom([TranslateModule.forRoot(provideTranslation())]),
        {
            provide: IMAGE_CONFIG,
            useValue: {
                disableImageSizeWarning: true,
                disableImageLazyLoadWarning: true
            }
        }
    ]
}
