import { Component } from '@angular/core'
import { NgIf, AsyncPipe, NgFor } from '@angular/common'
import { CardModule } from 'primeng/card'
import { DividerModule } from 'primeng/divider'
import { ButtonModule } from 'primeng/button'
import { ChipModule } from 'primeng/chip'
import { RippleModule } from 'primeng/ripple'
import feather from 'feather-icons'
import { svgPipe } from '../../pipes/svg.pipe'
import { trustHTML } from '../../pipes/trustHTML.pipe'
import { ToastService } from '../../services/toast/toast.service'

@Component({
    selector: 'app-accueil',
    imports: [
        NgIf,
        AsyncPipe,
        NgFor,
        CardModule,
        DividerModule,
        ButtonModule,
        ChipModule,
        RippleModule,
        svgPipe,
        trustHTML
    ],
    templateUrl: './accueil.component.html',
    styleUrl: './accueil.component.scss'
})
export class AccueilComponent {
    constructor(private toastService: ToastService) {}

    icons = {
        download: feather.icons.download
    }

    comming() {
        this.toastService.showInfo('À venir')
    }

    news = [
        {
            title: 'Joyeux mois des fiertés tout le monde ! 🏳️‍🌈',
            content:
                "<p>Beat Saber FR s'habille également des couleurs RGB car on est des GAYmers avant tout 😎</p><p><strong>&#64;Ralex</strong> a mis à jour les sabres BSFR pour l'occasion !</p>",
            date: 'jeudi 01 juin 2023',
            files: [
                {
                    name: 'BSFR_Saber_v1.4_Rainbow.saber'
                }
            ]
        },
        {
            title: 'BSFR Saber v1.4',
            content:
                '<u>Changelog :</u><ul><li>La tour Eiffel apparaît maintenant plus loin</li><li>Le poids du fichier a été réduit</li></ul>',
            date: 'samedi 22 avril 2023',
            files: [
                {
                    name: 'BSFR_Saber_v1.4.saber'
                }
            ]
        },
        {
            title: 'Publication de run Beat Saber',
            content:
                '<p>Les joueurs Quest ont désormais la possibilité de soumettre des runs depuis le formulaire de publication de run !</p>',
            date: 'mardi 10 janvier 2023',
            files: []
        },
        {
            title: 'BSFR Saber !',
            content:
                '<p>Heyow tout le monde !<br /><br />Après quelque temps passé à élaborer les sabres, nous avons le plaisir de vous présenter les sabres BSFR !<br />Ils ont été créés par notre cher <strong>&#64;Ralex</strong> ! Merci encore à toi &lt;3</p>',
            date: 'samedi 15 octobre 2022',
            files: [
                {
                    name: 'BSFR_Saber_v1.1.saber'
                }
            ]
        },
        {
            title: 'Multi POV BSFR #3',
            content:
                "<p>Les soumissions de run pour le Multi POV #3 sont ouvertes !<br />Vous avez jusqu'au vendredi 16 décembre 23h00 pour nous faire parvenir votre run.</p>",
            date: 'vendredi 6 Août 2022',
            files: []
        }
    ]
}
