import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, Observable } from 'rxjs'

export const SKIPS = [1, 2, 3, 4, 5, 14, 0]

export interface RankedleCurrent {
    id: number
    seasonId: number
    mapId: number
    date: Date
}

export interface RankedlePlayerScore {
    id: number
    rankedleId: number
    memberId: string
    dateStart: Date
    dateEnd: Date
    skips: number
    details:
        | {
              status: 'skip' | 'fail'
              text: string
              mapId?: string
              date: number
          }[]
        | null
    hint: boolean
    success: boolean | null
    messageId: number | null
}

export interface RankedleStats {
    victories: number
    defeats: number
    fastest: {
        memberId: string
        name: string
        avatar: string
        duration: string
    }
}

export interface RankedleResultMap {
    id: string
    songName: string
    cover: string
    levelAuthorName: string
}

export interface RankedleResult {
    map: RankedleResultMap
    score: RankedleScore
    points: number
    message: {
        content: string
        image: string
    }
}

export interface Rankedle {
    current: RankedleCurrent | null
    playerScore: RankedlePlayerScore | null
    stats: RankedleStats | null
    result: RankedleResult | null
}

export interface RankedlePlayerStats {
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

export interface RankedlePlayerRankingData {
    memberId: string
    name: string
    avatar: string
    points: number
    rank: number
    stats: RankedlePlayerStats
}

interface RankedleScore {
    success: boolean
    skips: number
    steps: Array<'skip' | 'fail' | 'success' | null>
}

export interface RankedleHistory {
    id: number
    cover: string
    songName: string
    levelAuthorName: string
    score: RankedleScore | null
    date: string
}

interface RankedleHistoryData {
    history: RankedleHistory[]
    first: number
    total: number
}

export interface HintResponse {
    hint: string
}

export interface SearchResult {
    id: number
    name: string
}

@Injectable({
    providedIn: 'root'
})
export class RankedleService {
    constructor(private http: HttpClient) {}

    public rankedle: BehaviorSubject<Rankedle | null> =
        new BehaviorSubject<Rankedle | null>(null)
    rankedle$: Observable<Rankedle | null> = this.rankedle.asObservable()

    public ranking: BehaviorSubject<RankedlePlayerRankingData[] | null> =
        new BehaviorSubject<RankedlePlayerRankingData[] | null>(null)
    ranking$: Observable<RankedlePlayerRankingData[] | null> =
        this.ranking.asObservable()

    public playerStats: BehaviorSubject<RankedlePlayerStats | null> =
        new BehaviorSubject<RankedlePlayerStats | null>(null)
    playerStats$: Observable<RankedlePlayerStats | null> =
        this.playerStats.asObservable()

    getCurrent() {
        return this.http.get<Rankedle | null>('/api/rankedle')
    }

    skip() {
        return this.http.post('/api/rankedle/skip', null)
    }

    submit(mapId: number) {
        return this.http.post('/api/rankedle/submit', {
            mapId
        })
    }

    hint() {
        return this.http.post<HintResponse>('/api/rankedle/hint', null)
    }

    searchSong(query: string) {
        return this.http.get<SearchResult[]>('/api/rankedle/song/search', {
            params: {
                query
            }
        })
    }

    getRanking() {
        return this.http.get<RankedlePlayerRankingData[]>(
            '/api/rankedle/ranking'
        )
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

    shareScore() {
        return this.http.get('/api/rankedle/share', {
            responseType: 'text'
        })
    }
}
