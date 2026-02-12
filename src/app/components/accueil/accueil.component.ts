import { Component, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { CardModule } from 'primeng/card'
import { DividerModule } from 'primeng/divider'
import { ButtonModule } from 'primeng/button'
import { SelectModule } from 'primeng/select'
import { ChipModule } from 'primeng/chip'
import { RippleModule } from 'primeng/ripple'
import { BeatsaberService } from '../../services/beatsaber/beatsaber.service'
import { finalize } from 'rxjs'

@Component({
    selector: 'app-accueil',
    imports: [
        FormsModule,
        CardModule,
        DividerModule,
        ButtonModule,
        SelectModule,
        ChipModule,
        RippleModule
    ],
    templateUrl: './accueil.component.html',
    styleUrl: './accueil.component.scss'
})
export class AccueilComponent {
    beatSaberService = inject(BeatsaberService)

    bsVersions = signal<string[]>([])
    bsVersionsLoading = signal(true)
    selectedBsVersion!: string

    ngOnInit(): void {
        this.beatSaberService
            .getVersions()
            .pipe(
                finalize(() => {
                    this.bsVersionsLoading.set(false)
                })
            )
            .subscribe((versions) => {
                this.bsVersions.set(versions)
            })
    }

    downloadBeatSaber() {
        this.beatSaberService.download(this.selectedBsVersion)
    }
}
