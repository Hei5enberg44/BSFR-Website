import { Component, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { CardModule } from 'primeng/card'
import { ButtonModule } from 'primeng/button'
import {
    AutoCompleteModule,
    AutoCompleteCompleteEvent
} from 'primeng/autocomplete'
import { Message } from 'primeng/message'

import { ToastService } from '../../../services/toast/toast.service'
import { UserService, City } from '../../../services/user/user.service'
import { catchError } from 'rxjs'

@Component({
    selector: 'app-profil-ville',
    standalone: true,
    imports: [
        FormsModule,
        CardModule,
        ButtonModule,
        AutoCompleteModule,
        Message
    ],
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

    city: City | null = null
    loading = true
    canSave = false
    saving = false

    navigateToInteractiveMap(event: MouseEvent) {
        event.preventDefault()
        this.router.navigate(['carte-interactive'])
    }

    suggestions: City[] = []

    search(event: AutoCompleteCompleteEvent) {
        this.userService.searchCity(event.query).subscribe((res) => {
            this.suggestions = res
        })
    }

    getCity() {
        this.city = null
        this.loading = true
        this.canSave = false
        this.userService.getCity().subscribe((city) => {
            this.city = city
            this.loading = false
        })
    }

    cityUpdated() {
        this.canSave = true
    }

    save() {
        this.saving = true
        this.userService
            .setCity(this.city)
            .pipe(
                catchError((error) => {
                    this.saving = false
                    throw error
                })
            )
            .subscribe(() => {
                this.saving = false
                this.canSave = false
                this.toastService.showSuccess(
                    'Votre ville a bien été sauvegardée'
                )
            })
    }
}
