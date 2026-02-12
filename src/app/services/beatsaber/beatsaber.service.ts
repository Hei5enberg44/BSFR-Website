import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'

@Injectable({
    providedIn: 'root'
})
export class BeatsaberService {
    constructor(private http: HttpClient) {}

    getVersions() {
        return this.http.get<string[]>('/api/beatsaber/versions')
    }

    download(version: string) {
        window.location.href = `/api/beatsaber/download/${version}`
    }
}
