import { Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { NgIf, NgFor } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { CardModule } from 'primeng/card'
import { DropdownModule } from 'primeng/dropdown'
import { AvatarModule } from 'primeng/avatar'
import { InputGroupModule } from 'primeng/inputgroup'
import { InputGroupAddonModule } from 'primeng/inputgroupaddon'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { SelectButtonModule } from 'primeng/selectbutton'
import { ButtonModule } from 'primeng/button'
import {
    EmEmojiPickerComponent,
    Emoji
} from '../../em-emoji-picker/em-emoji-picker.component'
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
    selector: 'app-agent-message',
    standalone: true,
    imports: [
        NgIf,
        NgFor,
        FormsModule,
        CardModule,
        DropdownModule,
        AvatarModule,
        InputGroupModule,
        InputGroupAddonModule,
        InputTextareaModule,
        ButtonModule,
        SelectButtonModule,
        EmEmojiPickerComponent,
        trustHTML
    ],
    templateUrl: './message.component.html',
    styleUrl: './message.component.scss'
})
export class AgentMessageComponent implements OnInit {
    constructor(
        private agentService: AgentService,
        private toastService: ToastService
    ) {}

    guildChannels: GuildChannelItemGroup[] = []
    channelMessages: ChannelMessageItem[] = []
    loadingChannels = true
    loadingMessages = false
    messagesDisabled = true
    canSave = false
    saving = false

    selectedChannel: string | null = null
    selectedMessage: string | null = null
    messageContent = ''
    mention = false

    @ViewChild('ta') textarea!: ElementRef<HTMLTextAreaElement>
    selectionStart = 0
    selectionEnd = 0

    ngOnInit(): void {
        this.agentService.getGuildChannels().subscribe((guildChannels) => {
            this.guildChannels = guildChannels.map((c) => {
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
            this.loadingChannels = false
        })
    }

    onChannelChange() {
        const channelId = this.selectedChannel
        if (channelId) {
            this.messagesDisabled = true
            this.loadingMessages = true
            this.agentService
                .getChannelMessages(channelId)
                .pipe(
                    finalize(() => {
                        this.loadingMessages = false
                    })
                )
                .subscribe((channelMessages) => {
                    this.channelMessages = channelMessages.map((m) => {
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
                    this.messagesDisabled = false
                })
            this.canSave = this.messageContent.trim() !== ''
        }
    }

    onMessageSelectionChange(event: Event) {
        this.selectionStart = (
            event.target as HTMLTextAreaElement
        ).selectionStart
        this.selectionEnd = (event.target as HTMLTextAreaElement).selectionEnd
    }

    onMessageInput(event: Event) {
        this.canSave =
            this.selectedChannel !== undefined &&
            this.messageContent.trim() !== ''
    }

    onEmoji(event: { emoji: Emoji; event: PointerEvent }) {
        const emoji = event.emoji
        let content = ''
        if (emoji.native) {
            content = `${emoji.native} `
        } else if (emoji.keywords && emoji.keywords.length === 1) {
            const identifier = emoji.keywords[0]
            content = `${identifier} `
        }
        this.messageContent =
            this.messageContent.substring(0, this.selectionStart) +
            content +
            this.messageContent.substring(this.selectionEnd)
        const textarea = this.textarea.nativeElement
        const selectionStart = textarea.selectionStart + content.length
        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(selectionStart, selectionStart)
        }, 100)
    }

    send() {
        if (!this.selectedChannel) {
            this.toastService.showError('Veuillez sélectionner un salon')
            return
        }
        if (this.messageContent.trim() === '') {
            this.toastService.showError('Le message ne peut pas être vide')
            return
        }

        this.saving = true

        this.agentService
            .sendMessage(
                this.selectedChannel,
                this.selectedMessage,
                this.messageContent.trim(),
                this.mention
            )
            .pipe(
                finalize(() => {
                    this.saving = false
                })
            )
            .subscribe(() => {
                this.selectedChannel = null
                this.selectedMessage = null
                this.messageContent = ''
                this.canSave = false
                this.toastService.showSuccess('Votre message a bien été envoyé')
            })
    }
}
