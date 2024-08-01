import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable } from 'rxjs'

export interface MemberCity {
    username: string
    avatarURL: string,
    coords: string,
    countryName: string,
    cityName: string
}

@Injectable({
    providedIn: 'root'
})
export class MapService {
    constructor(private http: HttpClient) {}

    public membersCity: BehaviorSubject<MemberCity[] | null> =
        new BehaviorSubject<MemberCity[] | null>(null)
    membersCity$: Observable<MemberCity[] | null> = this.membersCity.asObservable()

    getMembersCity() {
        return this.http.get<MemberCity[]>('/api/map/membersCity')
    }
}
