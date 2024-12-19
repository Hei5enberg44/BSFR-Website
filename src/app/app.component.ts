import { Component, OnInit } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { NavbarComponent } from './components/navbar/navbar.component'
import { FooterComponent } from './components/footer/footer.component'
import { ToastComponent } from './components/toast/toast.component'
import { TranslateService } from '@ngx-translate/core'
import { PrimeNG } from 'primeng/config'

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
    constructor(
        private primeng: PrimeNG,
        private translateService: TranslateService
    ) {}

    ngOnInit(): void {
        this.primeng.ripple.set(true)

        this.translateService.setDefaultLang('fr')
        const browserLang = this.translateService.getBrowserLang()
        this.translateService.use(
            browserLang?.match(/en|fr/) ? browserLang : 'fr'
        )
        this.translateService
            .get(browserLang?.match(/en|fr/) ? browserLang : 'fr')
            .subscribe((res) => this.primeng.setTranslation(res))
    }
}
