import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

export interface User {
    id: number
    userId: string
    token: string
}

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    constructor(private http: HttpClient) {}

    getUserById(id: number): Observable<User> {
        return this.http.get<User>(`/api/user/${id}`)
    }
}
