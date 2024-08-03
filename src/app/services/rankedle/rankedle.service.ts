import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable } from 'rxjs'

export interface Rankedle {
    id: number
    seasonId: number
    mapId: number
    date: Date
}

interface RankedlePlayerRanking {
    memberId: string
    name: string
    avatar: string
    points: number
    rank: number
    stats: {
        id: number
        try1: number
        try2: number
        try3: number
        try4: number
        try5: number
        try6: number
        played: number
        won: number
        currentStreak: number
        maxStreak: number
    }
}

@Injectable({
    providedIn: 'root'
})
export class RankedleService {
    constructor(private http: HttpClient) {}

    public rankedle: BehaviorSubject<Rankedle | null> =
        new BehaviorSubject<Rankedle | null>(null)
    rankedle$: Observable<Rankedle | null> = this.rankedle.asObservable()

    public ranking: BehaviorSubject<RankedlePlayerRanking[] | null> =
        new BehaviorSubject<RankedlePlayerRanking[] | null>(null)
    ranking$: Observable<RankedlePlayerRanking[] | null> =
        this.ranking.asObservable()

    public playerStats: BehaviorSubject<any> = new BehaviorSubject<any>(null)
    playerStats$: Observable<any> = this.ranking.asObservable()

    getCurrent() {
        return this.http.get<Rankedle | null>('/api/rankedle/current')
    }

    getRanking() {
        return this.http.get<RankedlePlayerRanking[]>('/api/rankedle/ranking')
    }
}
