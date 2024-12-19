import { Component, OnInit, signal } from '@angular/core'
import { NgIf } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { CardModule } from 'primeng/card'
import { SkeletonModule } from 'primeng/skeleton'
import { ButtonModule } from 'primeng/button'
import { DividerModule } from 'primeng/divider'
import { TableModule } from 'primeng/table'
import { AvatarModule } from 'primeng/avatar'
import {
    AutoCompleteModule,
    AutoCompleteCompleteEvent
} from 'primeng/autocomplete'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { Message } from 'primeng/message'
import { ConfirmationService, ToastMessageOptions } from 'primeng/api'

import { AudioPlayerComponent } from './player/player.component'
import { trustHTML } from '../../../pipes/trustHTML.pipe'

import {
    Rankedle,
    RankedleCurrent,
    RankedlePlayerScore,
    RankedleStats,
    RankedleResult,
    RankedleService,
    SearchResult,
    SKIPS
} from '../../../services/rankedle/rankedle.service'
import { finalize } from 'rxjs'

@Component({
    selector: 'app-rankedle-jeu',
    imports: [
        NgIf,
        FormsModule,
        CardModule,
        SkeletonModule,
        ButtonModule,
        DividerModule,
        TableModule,
        AvatarModule,
        AutoCompleteModule,
        ConfirmDialogModule,
        Message,
        AudioPlayerComponent,
        trustHTML
    ],
    templateUrl: './jeu.component.html',
    styleUrl: './jeu.component.scss'
})
export class RankedleJeuComponent implements OnInit {
    constructor(
        private rankedleService: RankedleService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.getRankedle()
        this.checkForNewRankedle()
    }

    ngOnDestroy(): void {
        clearInterval(this.checkInterval)
    }

    rankedleCurrent: RankedleCurrent | null = null
    rankedlePlayerScore: RankedlePlayerScore | null = null
    rankedleStats: RankedleStats | null = null
    rankedleResult: RankedleResult | null = null

    checkInterval!: any

    detailMessages = signal<ToastMessageOptions[]>([])
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
            if (this.rankedleCurrent?.id !== rankedle.current?.id) {
                this.rankedleCurrent = null
                this.rankedlePlayerScore = null
                this.rankedleResult = null
                this.hint = null
                this.detailMessages.set([])
            }

            this.rankedleCurrent = rankedle.current
            this.rankedlePlayerScore = rankedle.playerScore
            this.rankedleStats = rankedle.stats
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
                        const messages: ToastMessageOptions[] = []
                        for (const detail of playerScore.details) {
                            messages.push({
                                key: 'details',
                                icon: `pi ${detail.status === 'skip' ? 'pi-step-forward' : detail.status === 'fail' ? 'pi-times' : ''}`,
                                severity:
                                    detail.status === 'skip'
                                        ? 'secondary'
                                        : detail.status === 'fail'
                                          ? 'error'
                                          : 'contrast',
                                text:
                                    detail.status === 'skip'
                                        ? 'PASSÉ'
                                        : detail.text
                            })
                        }
                        this.detailMessages.set(messages)
                    } else {
                        if (!this.rankedleResult) {
                            const detail = [...playerScore.details.reverse()][0]
                            const detailMessage = {
                                key: 'details',
                                closable: false,
                                icon: `pi ${detail.status === 'skip' ? 'pi-step-forward' : detail.status === 'fail' ? 'pi-times' : ''}`,
                                severity:
                                    detail.status === 'skip'
                                        ? 'secondary'
                                        : detail.status === 'fail'
                                          ? 'error'
                                          : 'contrast',
                                text:
                                    detail.status === 'skip'
                                        ? 'PASSÉ'
                                        : detail.text
                            }
                            this.detailMessages.update((messages) => [
                                ...messages,
                                detailMessage
                            ])
                        } else if (this.rankedleResult.score.success === true) {
                            const detailMessage = {
                                key: 'details',
                                closable: false,
                                icon: 'pi pi-trophy',
                                severity: 'success',
                                text: this.rankedleResult?.map.songName
                            }
                            this.detailMessages.update((messages) => [
                                ...messages,
                                detailMessage
                            ])
                        }
                    }
                }
                if (
                    this.rankedleResult &&
                    this.rankedleResult.score.success === true
                ) {
                    this.detailMessages.update((messages) => [
                        ...messages,
                        {
                            key: 'details',
                            icon: 'pi pi-trophy',
                            severity: 'success',
                            text: this.rankedleResult?.map.songName
                        }
                    ])
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
                header: 'Indice',
                accept: () => {
                    this.hintAccept()
                },
                reject: () => {}
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

    checkForNewRankedle() {
        this.checkInterval = setInterval(() => {
            this.rankedleService
                .getCurrent()
                .pipe(
                    finalize(() => {
                        this.loading = false
                    })
                )
                .subscribe((rankedle) => {
                    if (rankedle?.current?.id !== this.rankedleCurrent?.id)
                        this.init(rankedle)
                    if (rankedle) this.rankedleStats = rankedle.stats
                })
        }, 60000)
    }
}
