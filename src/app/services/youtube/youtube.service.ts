import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

export interface YouTubeVideo {
    videoId: string
    publishedAt: Date
    title: string
}

@Injectable({
    providedIn: 'root'
})
export class YoutubeService {
    constructor(private http: HttpClient) {}

    getLastVideo() {
        return this.http.get<YouTubeVideo>('/api/youtube/getLastVideo')
    }
}
