import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

interface Member {
    id: string
    name: string
    avatar: string
}

export interface GuildChannel {
    id: string
    name: string
    type: number
    position: number
    channels:
        | {
              id: string
              name: string
              type: number
              position: number
          }[]
        | null
}

export interface ChannelMessage {
    id: string
    author: Member & { color: string }
    content: string
    createdAt: Date
}

@Injectable({
    providedIn: 'root'
})
export class AgentService {
    constructor(private http: HttpClient) {}

    getGuildChannels() {
        return this.http.get<GuildChannel[]>('/api/agent/guildChannels')
    }

    getChannelMessages(channelId: string) {
        return this.http.get<ChannelMessage[]>('/api/agent/channelMessages', {
            params: {
                channelId
            }
        })
    }

    sendMessage(
        channelId: string,
        messageId: string | null,
        content: string,
        mention: boolean
    ) {
        return this.http.post('/api/agent/sendMessage', {
            channelId,
            messageId,
            content,
            mention
        })
    }

    sendReaction(
        channelId: string,
        messageId: string,
        emoji: string,
        native: boolean
    ) {
        return this.http.post('/api/agent/sendReaction', {
            channelId,
            messageId,
            emoji,
            native
        })
    }
}
