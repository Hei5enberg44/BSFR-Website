import { Component, OnInit } from '@angular/core'
import { NgIf } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { CardModule } from 'primeng/card'
import { SkeletonModule } from 'primeng/skeleton'
import { ButtonModule } from 'primeng/button'
import {
    AutoCompleteModule,
    AutoCompleteCompleteEvent
} from 'primeng/autocomplete'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { MessagesModule } from 'primeng/messages'
import { ConfirmationService, Message, MessageService } from 'primeng/api'

import { AudioPlayerComponent } from './player/player.component'
import { trustHTML } from '../../../pipes/trustHTML.pipe'

import {
    Rankedle,
    RankedleCurrent,
    RankedlePlayerScore,
    RankedleResult,
    RankedleService,
    SearchResult,
    SKIPS
} from '../../../services/rankedle/rankedle.service'
import { finalize } from 'rxjs'

@Component({
    selector: 'app-rankedle-jeu',
    standalone: true,
    imports: [
        NgIf,
        FormsModule,
        CardModule,
        SkeletonModule,
        ButtonModule,
        AutoCompleteModule,
        ConfirmDialogModule,
        MessagesModule,
        AudioPlayerComponent,
        trustHTML
    ],
    templateUrl: './jeu.component.html',
    styleUrl: './jeu.component.scss'
})
export class RankedleJeuComponent implements OnInit {
    constructor(
        private rankedleService: RankedleService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.getRankedle()
    }

    rankedleCurrent: RankedleCurrent | null = null
    rankedlePlayerScore: RankedlePlayerScore | null = null
    rankedleResult: RankedleResult | null = null

    detailMessages: Message[] = []
    loading = true

    selectedSong: number | null = null
    songList: SearchResult[] = []

    skipLabel = 'PASSER'
    submitLabel = 'ENVOYER'

    hint: string | null = null
    hintConfirmLoading = false
    hintRedeemed = false
    hintAvailable = false
    canSearch = false
    canSkip = false
    canSubmit = false

    hintLoading = true
    searchLoading = true
    skipLoading = true
    submitLoading = true

    shareLabel = 'Partager'
    shareIcon = 'pi pi-share-alt'
    shareLoading = false

    noRankedleMessage: Message[] = [
        {
            severity: 'info',
            icon: 'pi pi-info-circle',
            closable: false,
            detail: "Il n'y a pas de Rankedle en cours. Revenez plus tard."
        }
    ]

    getRankedle() {
        this.rankedleService
            .getCurrent()
            .pipe(
                finalize(() => {
                    this.loading = false
                })
            )
            .subscribe((rankedle) => {
                this.init(rankedle)
            })
    }

    init(rankedle: Rankedle | null) {
        if (rankedle) {
            this.rankedleCurrent = rankedle.current
            this.rankedlePlayerScore = rankedle.playerScore
            this.rankedleResult = rankedle.result

            const playerScore = rankedle.playerScore
            if (playerScore) {
                if (playerScore.success === null) {
                    this.hintAvailable = false
                    this.canSearch = false
                    this.canSkip = false
                    this.canSubmit = false

                    const skips = playerScore.skips
                    if (skips < 6) {
                        this.canSkip = true
                        this.skipLabel = `PASSER (+${SKIPS[skips]}s)`
                    }
                    this.hintAvailable = skips === 5
                    this.hintRedeemed = playerScore.hint
                    if (skips === 6) {
                        this.skipLabel = 'PASSER'
                        this.canSubmit = true
                        this.submitLabel = 'TERMINER'
                    } else {
                        this.canSearch = true
                    }
                }

                if (playerScore.details) {
                    if (this.detailMessages.length === 0) {
                        const messages: Message[] = []
                        for (const detail of playerScore.details) {
                            messages.push({
                                key: 'details',
                                closable: false,
                                icon: `pi ${detail.status === 'skip' ? 'pi-step-forward' : detail.status === 'fail' ? 'pi-times' : ''}`,
                                severity:
                                    detail.status === 'skip'
                                        ? 'secondary'
                                        : detail.status === 'fail'
                                          ? 'error'
                                          : 'contrast',
                                detail:
                                    detail.status === 'skip'
                                        ? 'PASSÉ'
                                        : detail.text
                            })
                        }
                        if (
                            this.rankedleResult &&
                            this.rankedleResult.score.success === true
                        ) {
                            messages.push({
                                key: 'details',
                                closable: false,
                                icon: 'pi pi-trophy',
                                severity: 'success',
                                detail: this.rankedleResult.map.songName
                            })
                        }
                        this.detailMessages = messages
                    } else {
                        if (!this.rankedleResult) {
                            const detail = [...playerScore.details.reverse()][0]
                            this.messageService.add({
                                key: 'details',
                                closable: false,
                                icon: `pi ${detail.status === 'skip' ? 'pi-step-forward' : detail.status === 'fail' ? 'pi-times' : ''}`,
                                severity:
                                    detail.status === 'skip'
                                        ? 'secondary'
                                        : detail.status === 'fail'
                                          ? 'error'
                                          : 'contrast',
                                detail:
                                    detail.status === 'skip'
                                        ? 'PASSÉ'
                                        : detail.text
                            })
                        } else if (this.rankedleResult.score.success === true) {
                            this.messageService.add({
                                key: 'details',
                                closable: false,
                                icon: 'pi pi-trophy',
                                severity: 'success',
                                detail: this.rankedleResult.map.songName
                            })
                        }
                    }
                }
            } else {
                this.canSearch = true
                this.hintAvailable = false
                this.canSkip = true
                this.skipLabel = `PASSER (+1s)`
            }

            this.hintLoading = false
            this.searchLoading = false
            this.skipLoading = false
            this.submitLoading = false
        }
    }

    searchSong(event: AutoCompleteCompleteEvent) {
        this.rankedleService
            .searchSong(event.query)
            .subscribe((searchResult) => {
                this.songList = searchResult
            })
    }

    onSongSelect() {
        this.canSubmit = true
    }

    onSongClear() {
        this.canSubmit = false
    }

    hintConfirm(event: Event) {
        if (!this.hintRedeemed) {
            this.confirmationService.confirm({
                key: 'hint',
                message: "Êtes-vous sûr(e) de vouloir prendre l'indice ?",
                header: 'Indice'
            })
        } else {
            this.showHint()
        }
    }

    hintAccept() {
        this.hintConfirmLoading = true
        this.rankedleService
            .hint()
            .pipe(
                finalize(() => {
                    this.hintConfirmLoading = false
                })
            )
            .subscribe((hintResponse) => {
                this.hintRedeemed = true
                this.hint = hintResponse.hint
            })
    }

    showHint() {
        this.hintLoading = true
        this.rankedleService
            .hint()
            .pipe(
                finalize(() => {
                    this.hintLoading = false
                })
            )
            .subscribe((hintResponse) => {
                this.hint = hintResponse.hint
                this.confirmationService.confirm({
                    key: 'hint'
                })
            })
    }

    skip() {
        this.skipLoading = true
        this.rankedleService
            .skip()
            .pipe(
                finalize(() => {
                    this.skipLoading = false
                })
            )
            .subscribe(() => {
                this.getRankedle()
            })
    }

    submit() {
        this.submitLoading = true

        const playerScore = this.rankedlePlayerScore
        if (playerScore && playerScore.skips === 6) {
            this.rankedleService
                .skip()
                .pipe(
                    finalize(() => {
                        this.submitLoading = false
                    })
                )
                .subscribe(() => {
                    this.getRankedle()
                })
        } else {
            if (this.selectedSong !== null) {
                this.canSearch = false
                this.rankedleService
                    .submit(this.selectedSong)
                    .pipe(
                        finalize(() => {
                            this.canSearch = true
                            this.submitLoading = false
                            this.selectedSong = null
                        })
                    )
                    .subscribe(() => {
                        this.getRankedle()
                    })
            } else {
                this.submitLoading = false
            }
        }
    }

    share() {
        const shareLabel = this.shareLabel
        const shareIcon = this.shareIcon

        this.shareLoading = true

        this.rankedleService
            .shareScore()
            .pipe(
                finalize(() => {
                    this.shareLoading = false
                })
            )
            .subscribe((score) => {
                navigator.clipboard.writeText(score)

                this.shareLabel = 'Copié !'
                this.shareIcon = 'pi pi-clipboard'

                setTimeout(() => {
                    this.shareLabel = shareLabel
                    this.shareIcon = shareIcon
                }, 1000)
            })
    }
}
