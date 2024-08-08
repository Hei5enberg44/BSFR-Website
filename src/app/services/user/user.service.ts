import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable } from 'rxjs'

export interface User {
    id: string
    username: string
    avatarURL: string
    isBSFR: boolean
    isAdmin: boolean
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private http: HttpClient) {}

    public user: BehaviorSubject<User | null> =
        new BehaviorSubject<User | null>(null)
    user$: Observable<User | null> = this.user.asObservable()

    getUser() {
        return this.http.get<User | null>('/api/discord/@me')
    }
}
