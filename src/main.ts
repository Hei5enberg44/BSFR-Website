import { bootstrapApplication } from '@angular/platform-browser'
import { enableProdMode } from '@angular/core'
import { appConfig } from './app/app.config'
import { App } from './app/app'
import { environment } from './environments/environment'

if (environment.production) enableProdMode()

bootstrapApplication(App, appConfig).catch((err) => console.error(err))
