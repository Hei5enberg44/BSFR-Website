import { Injectable, signal } from '@angular/core'
import { HttpClient } from '@angular/common/http'

export interface MemberCity {
    username: string
    avatarURL: string
    coords: string
    countryName: string
    cityName: string
}

@Injectable({
    providedIn: 'root'
})
export class MapService {
    constructor(private http: HttpClient) {}

    membersCity = signal<MemberCity[] | null>(null)

    getMembersCity() {
        return this.http.get<MemberCity[]>('/api/map/membersCity')
    }
}
