import { Component, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { CardModule } from 'primeng/card'
import { Select } from 'primeng/select'
import { AvatarModule } from 'primeng/avatar'
import { ButtonModule } from 'primeng/button'
import { EmEmojiPickerComponent, Emoji } from '../../em-emoji-picker/em-emoji-picker.component'
import { trustHTML } from '../../../pipes/trustHTML.pipe'

import { AgentService } from '../../../services/agent/agent.service'
import { ToastService } from '../../../services/toast/toast.service'
import { finalize } from 'rxjs'

interface GuildChannelItemGroup extends GuildChannelItem {
    items: GuildChannelItem[]
}

interface GuildChannelItem {
    name: string
    value: string
    type: number
}

interface ChannelMessageItem {
    value: string
    author: {
        id: string
        name: string
        avatar: string
    }
    content: string
}

@Component({
    selector: 'app-agent-reaction',
    imports: [
        FormsModule,
        CardModule,
        Select,
        AvatarModule,
        ButtonModule,
        EmEmojiPickerComponent,
        trustHTML
    ],
    templateUrl: './reaction.component.html',
    styleUrl: './reaction.component.scss'
})
export class AgentReactionComponent {
    constructor(
        private agentService: AgentService,
        private toastService: ToastService
    ) {}

    guildChannels = signal<GuildChannelItemGroup[]>([])
    channelMessages = signal<ChannelMessageItem[]>([])
    loadingChannels = signal(true)
    loadingMessages = signal(false)
    messagesDisabled = signal(true)
    canSave = signal(false)
    saving = signal(false)

    selectedChannel: string | null = null
    selectedMessage: string | null = null
    selectedEmoji: Emoji | null = null

    ngOnInit(): void {
        this.agentService
            .getGuildChannels()
            .pipe(
                finalize(() => {
                    this.loadingChannels.set(false)
                })
            )
            .subscribe((guildChannels) => {
                this.guildChannels.set(
                    guildChannels.map((c) => {
                        return {
                            name: c.channels ? c.name : '',
                            value: c.id,
                            type: c.type,
                            items: c.channels
                                ? c.channels.map((cc) => {
                                      return {
                                          name: cc.name,
                                          value: cc.id,
                                          type: cc.type
                                      }
                                  })
                                : [
                                      {
                                          name: c.name,
                                          value: c.id,
                                          type: c.type
                                      }
                                  ]
                        }
                    })
                )
                this.loadingChannels.set(false)
            })
    }

    onChannelChange() {
        const channelId = this.selectedChannel
        if (channelId) {
            this.selectedMessage = null
            this.messagesDisabled.set(true)
            this.loadingMessages.set(true)
            this.agentService
                .getChannelMessages(channelId)
                .pipe(
                    finalize(() => {
                        this.loadingMessages.set(false)
                    })
                )
                .subscribe((channelMessages) => {
                    this.channelMessages.set(
                        channelMessages.map((m) => {
                            return {
                                value: m.id,
                                author: m.author,
                                content: m.content.replace(/\n/g, '<br>'),
                                date: new Intl.DateTimeFormat('fr-FR', {
                                    dateStyle: 'short',
                                    timeStyle: 'short'
                                }).format(new Date(m.createdAt))
                            }
                        })
                    )
                    this.messagesDisabled.set(false)
                })
            this.canSave.set(false)
        }
    }

    onMessageChange() {
        const messageId = this.selectedMessage
        if (messageId) {
            this.canSave.set(this.selectedChannel !== null && this.selectedEmoji !== null)
        }
    }

    onEmoji(event: { emoji: Emoji; event: PointerEvent }) {
        this.canSave.set(this.selectedChannel !== null && this.selectedMessage !== null)
    }

    send() {
        if (!this.selectedChannel) {
            this.toastService.showError('Veuillez sélectionner un salon')
            return
        }
        if (!this.selectedMessage) {
            this.toastService.showError('Veuillez sélectionner un message')
            return
        }
        if (!this.selectedEmoji) {
            this.toastService.showError('Veuillez sélectionner une réaction')
            return
        }

        const emoji = this.selectedEmoji.native
            ? this.selectedEmoji.native
            : this.selectedEmoji.keywords && this.selectedEmoji.keywords[1]
              ? this.selectedEmoji.keywords[1]
              : undefined
        if (!emoji) {
            this.toastService.showError("Impossible d'envoyer la réaction sélectionnée")
            return
        }

        this.saving.set(true)

        this.agentService
            .sendReaction(
                this.selectedChannel,
                this.selectedMessage,
                emoji,
                this.selectedEmoji.native !== undefined
            )
            .pipe(
                finalize(() => {
                    this.saving.set(false)
                })
            )
            .subscribe(() => {
                this.selectedChannel = null
                this.selectedMessage = null
                this.selectedEmoji = null
                this.canSave.set(false)
                this.toastService.showSuccess('La réaction a bien été envoyée')
            })
    }
}
