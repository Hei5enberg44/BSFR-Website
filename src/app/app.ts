import { Component, OnInit } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { PrimeNG } from 'primeng/config'
import { TranslateService } from '@ngx-translate/core'

import { NavbarComponent } from './components/navbar/navbar.component'
import { FooterComponent } from './components/footer/footer.component'
import { ToastComponent } from './components/toast/toast.component'

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastComponent],
    templateUrl: './app.html',
    styleUrl: './app.css'
})
export class App implements OnInit {
    constructor(
        private primeng: PrimeNG,
        private translateService: TranslateService
    ) {}

    ngOnInit() {
        this.primeng.ripple.set(true)

        this.translateService.addLangs(['fr', 'en'])
        this.translateService.setFallbackLang('fr')

        const browserLang = this.translateService.getBrowserLang()
        this.translate(browserLang?.match(/en|fr/) ? browserLang : 'fr')
    }

    translate(lang: string) {
        this.translateService.use(lang)
        this.translateService.get('primeng').subscribe((res) => this.primeng.setTranslation(res))
    }
}
