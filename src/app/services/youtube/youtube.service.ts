import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

export interface YouTubeVideo {
    videoId: string
    publishedAt: Date
    title: string
}

export interface RunForm {
    url: string
    description: string
    ldProfile: string
    mapLd: string
    beatsaverUrl: string
    headset: number
    grip: string
    twitchUrl: string
    comment: string
}

@Injectable({
    providedIn: 'root'
})
export class YoutubeService {
    constructor(private http: HttpClient) {}

    getLastVideo() {
        return this.http.get<YouTubeVideo>('/api/youtube/lastVideo')
    }

    submitRun(form: RunForm) {
        return this.http.post('/api/youtube/run', form)
    }
}
