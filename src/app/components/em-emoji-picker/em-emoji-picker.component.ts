import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    ViewChild
} from '@angular/core'
import { NgIf } from '@angular/common'
import { ButtonModule } from 'primeng/button'
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel'
import emojisData from '@emoji-mart/data/sets/15/twitter.json'
import fr from '@emoji-mart/data/i18n/fr.json'
declare var EmojiMart: any

import { AdminService, GuildEmoji } from '../../services/admin/admin.service'
import { trustHTML } from '../../pipes/trustHTML.pipe'

export interface Emoji {
    id?: string
    keywords?: string[]
    name?: string
    native?: string
    shortcodes?: string
    src?: string
}

@Component({
    selector: 'app-em-emoji-picker',
    standalone: true,
    imports: [NgIf, ButtonModule, OverlayPanelModule, trustHTML],
    templateUrl: './em-emoji-picker.component.html',
    styleUrl: './em-emoji-picker.component.scss'
})
export class EmEmojiPickerComponent implements OnInit {
    constructor(private adminService: AdminService) {}

    loading = true
    guildEmojis: GuildEmoji[] = []

    @ViewChild('op') overlaypanel!: OverlayPanel
    @Input() updatePreview = true
    @Input() theme = 'dark'
    @Input() set = 'twitter'
    @Input() selectedEmoji: string = ''

    @Output() onEmoji = new EventEmitter<{
        emoji: Emoji
        event: PointerEvent
    }>()

    ngOnInit(): void {
        EmojiMart.init({ data: emojisData })
        this.adminService.getGuildEmojis().subscribe((emojis) => {
            this.loading = false
            this.guildEmojis = emojis
        })
        this.setSelectedEmoji({ native: '😀' })
    }

    toggleOverlay(event: Event) {
        const target =
            (event.target as Element).closest('.p-inputgroup-addon') ??
            undefined
        this.overlaypanel.toggle(event, target)
    }

    setSelectedEmoji(emoji: Emoji) {
        if (emoji.native) {
            this.selectedEmoji = `<em-emoji set="${this.set}" native="${emoji.native}" size="1.5rem"></em-emoji>`
        } else {
            this.selectedEmoji = `<img src="${emoji.src}" width="23" height="23" />`
        }
    }

    showEmojis() {
        const $picker = document.getElementById('picker') as HTMLDivElement
        $picker.innerHTML = ''

        const props = {
            parent: $picker,
            data: emojisData,
            i18n: fr,
            set: this.set,
            theme: this.theme,
            skinTonePosition: 'search',
            custom: [
                {
                    id: 'bsfr',
                    name: 'Beat Saber FR',
                    emojis: this.guildEmojis.map((e) => {
                        return {
                            id: e.name,
                            keywords: [e.identifier],
                            skins: [{ src: e.iconURL }]
                        }
                    })
                }
            ],
            categoryIcons: {
                bsfr: {
                    src: '/images/logo/transparent_animated.webp'
                }
            },
            onEmojiSelect: (emoji: Emoji, event: PointerEvent) => {
                this.overlaypanel.toggle(event)
                this.onEmoji.emit({ emoji, event })
                if (this.updatePreview) {
                    this.setSelectedEmoji(emoji)
                }
            }
        }

        new EmojiMart.Picker(props)
    }
}
