import {
    ApplicationConfig,
    provideZoneChangeDetection,
    importProvidersFrom
} from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { provideRouter, withComponentInputBinding } from '@angular/router'
import {
    HttpClient,
    provideHttpClient,
    withFetch,
    withInterceptors
} from '@angular/common/http'
import { HttpErrorsInterceptor } from './interceptors/http/errors.interceptor'

import { routes } from './app.routes'
import { ConfirmationService, MessageService } from 'primeng/api'
import { TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { TranslateHttpLoader } from '@ngx-translate/http-loader'

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

export const appConfig: ApplicationConfig = {
    providers: [
        MessageService,
        ConfirmationService,
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes, withComponentInputBinding()),
        provideAnimations(),
        provideHttpClient(
            withFetch(),
            withInterceptors([HttpErrorsInterceptor])
        ),
        importProvidersFrom([TranslateModule.forRoot(provideTranslation())])
    ]
}
