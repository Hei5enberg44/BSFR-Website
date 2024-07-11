import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable } from 'rxjs'

interface User {
    id: string
    username: string
    avatarURL: string
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
        return this.http.get<User>('/api/discord/@me')
    }
}
