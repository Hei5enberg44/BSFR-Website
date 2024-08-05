import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable } from 'rxjs'

export interface Rankedle {
    id: number
    seasonId: number
    mapId: number
    date: Date
}

interface RankedlePlayerStats {
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

interface RankedlePlayer {
    memberId: string
    name: string
    avatar: string
    points: number
    rank: number
    stats: RankedlePlayerStats
}

export interface RankedleHistory {
    id: number
    cover: string
    songName: string
    levelAuthorName: string
    score: string[]
    date: string
}

interface RankedleHistoryData {
    history: RankedleHistory[]
    first: number
    total: number
}

@Injectable({
    providedIn: 'root'
})
export class RankedleService {
    constructor(private http: HttpClient) {}

    public rankedle: BehaviorSubject<Rankedle | null> =
        new BehaviorSubject<Rankedle | null>(null)
    rankedle$: Observable<Rankedle | null> = this.rankedle.asObservable()

    public ranking: BehaviorSubject<RankedlePlayer[] | null> =
        new BehaviorSubject<RankedlePlayer[] | null>(null)
    ranking$: Observable<RankedlePlayer[] | null> = this.ranking.asObservable()

    public playerStats: BehaviorSubject<RankedlePlayerStats | null> =
        new BehaviorSubject<RankedlePlayerStats | null>(null)
    playerStats$: Observable<RankedlePlayerStats | null> =
        this.playerStats.asObservable()

    getCurrent() {
        return this.http.get<Rankedle | null>('/api/rankedle/current')
    }

    getRanking() {
        return this.http.get<RankedlePlayer[]>('/api/rankedle/ranking')
    }

    getPlayerStats() {
        return this.http.get<RankedlePlayerStats | null>('/api/rankedle/stats')
    }

    getHistory(first: number = 0, rows: number = 10) {
        return this.http.get<RankedleHistoryData>(`/api/rankedle/history`, {
            params: {
                first,
                rows
            }
        })
    }
}
