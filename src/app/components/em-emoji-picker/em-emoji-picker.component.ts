import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    SimpleChanges,
    signal
} from '@angular/core'
import { ButtonModule } from 'primeng/button'
import { ConfirmDialogModule } from 'primeng/confirmdialog'
import { ConfirmationService } from 'primeng/api'

import emojisData from '@emoji-mart/data/sets/15/twitter.json'
import fr from '@emoji-mart/data/i18n/fr.json'
declare var EmojiMart: any

import { AdminService, GuildEmoji } from '../../services/admin/admin.service'
import { DeviceDetectorService } from 'ngx-device-detector'
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
    imports: [ButtonModule, ConfirmDialogModule, trustHTML],
    templateUrl: './em-emoji-picker.component.html',
    styleUrl: './em-emoji-picker.component.scss'
})
export class EmEmojiPickerComponent implements OnInit {
    constructor(
        private adminService: AdminService,
        private confirmationService: ConfirmationService,
        private deviceService: DeviceDetectorService
    ) {}

    loading = signal(true)
    guildEmojis = signal<GuildEmoji[]>([])

    @Input() updatePreview = true
    @Input() theme = 'dark'
    @Input() set = 'twitter'
    @Input() selectedEmoji: string | null = null
    @Input() value: Emoji | null = null
    @Input() styleClass = ''
    @Output() valueChange = new EventEmitter<Emoji>()

    @Output() onEmoji = new EventEmitter<{
        emoji: Emoji
        event: PointerEvent
    }>()

    ngOnInit(): void {
        this.styleClass += ' inputgroup'
        EmojiMart.init({ data: emojisData })
        this.adminService.getGuildEmojis().subscribe((emojis) => {
            this.loading.set(false)
            this.guildEmojis.set(emojis)
        })
        this.setSelectedEmoji(this.value ?? { native: '😀' })
    }

    ngOnChanges(changes: SimpleChanges) {
        if (
            changes['value'] &&
            !changes['value'].firstChange &&
            changes['value'].currentValue === null
        ) {
            this.setSelectedEmoji({ native: '😀' })
        }
    }

    setSelectedEmoji(emoji: Emoji) {
        if (emoji.native) {
            this.selectedEmoji = `<em-emoji set="${this.set}" native="${emoji.native}"${emoji.shortcodes ? ` shortcodes="${emoji.shortcodes}"` : ''} size="1.5rem"></em-emoji>`
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
            perLine: this.touchUI ? 8 : 9,
            emojiButtonSize: this.touchUI ? 36 : 42,
            emojiSize: this.touchUI ? 24 : 30,
            custom: [
                {
                    id: 'bsfr',
                    name: 'Beat Saber FR',
                    emojis: this.guildEmojis().map((e) => {
                        return {
                            id: e.name,
                            keywords: [e.identifier, e.id],
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
            onEmojiSelect: this.onEmojiSelect.bind(this)
        }

        new EmojiMart.Picker(props)

        // const $mask = Array.from(document.querySelectorAll('.p-dialog-mask'))
        // if($mask.length > 0) {
        //     $mask[$mask.length - 1].addEventListener('click', () => {
        //         this.hideDialog()
        //     })
        // }
    }

    onEmojiSelect(emoji: Emoji, event: PointerEvent) {
        this.value = emoji
        this.valueChange.emit(emoji)
        this.onEmoji.emit({ emoji, event })
        if (this.updatePreview) {
            this.setSelectedEmoji(emoji)
        }
        this.hideDialog()
    }

    get touchUI() {
        return this.deviceService.isMobile() || this.deviceService.isTablet()
    }

    showDialog() {
        this.confirmationService.confirm({
            key: 'emoji-picker-dialog'
        })
        setTimeout(() => {
            this.showEmojis()
        }, 100)
    }

    hideDialog() {
        this.confirmationService?.close()
    }
}
