import { Component, OnInit, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { CardModule } from 'primeng/card'
import { ButtonModule } from 'primeng/button'
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete'
import { Message } from 'primeng/message'

import { ToastService } from '../../../services/toast/toast.service'
import { UserService, City } from '../../../services/user/user.service'
import { catchError } from 'rxjs'

@Component({
    selector: 'app-profil-ville',
    imports: [FormsModule, CardModule, ButtonModule, AutoCompleteModule, Message],
    templateUrl: './ville.component.html',
    styleUrl: './ville.component.scss'
})
export class ProfilVilleComponent implements OnInit {
    constructor(
        private toastService: ToastService,
        private userService: UserService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.getCity()
    }

    city = signal<City | null>(null)
    loading = signal(true)
    canSave = signal(false)
    saving = signal(false)

    navigateToInteractiveMap(event: MouseEvent) {
        event.preventDefault()
        this.router.navigate(['carte-interactive'])
    }

    suggestions = signal<City[]>([])

    search(event: AutoCompleteCompleteEvent) {
        this.userService.searchCity(event.query).subscribe((res) => {
            this.suggestions.set(res)
        })
    }

    getCity() {
        this.city.set(null)
        this.loading.set(true)
        this.canSave.set(false)
        this.userService.getCity().subscribe((city) => {
            this.city.set(city)
            this.loading.set(false)
        })
    }

    cityUpdated() {
        this.canSave.set(true)
    }

    save() {
        this.saving.set(true)
        this.userService
            .setCity(this.city())
            .pipe(
                catchError((error) => {
                    this.saving.set(false)
                    throw error
                })
            )
            .subscribe(() => {
                this.saving.set(false)
                this.canSave.set(false)
                this.toastService.showSuccess('Votre ville a bien été sauvegardée')
            })
    }
}
