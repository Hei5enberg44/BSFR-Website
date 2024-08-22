import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { FilterMetadata } from 'primeng/api'
import { MemberCardStatus } from '../user/user.service'

interface PaginationResponse {
    first: number
    total: number
}

interface Member {
    id: string
    name: string
    avatar: string
}

export interface Birthday {
    member: Member
    date: string
}

interface BirthdayData extends PaginationResponse {
    birthdays: Birthday[]
}

export interface Mute {
    member: Member
    author: Member
    reason: string
    muteDate: Date | string
    unmuteDate: Date | string
}

interface MuteData extends PaginationResponse {
    mutes: Mute[]
}

export interface Ban {
    member: Member
    author: Member
    approver: Member
    reason: string
    banDate: Date | string
    unbanDate: Date | string
}

interface BanData extends PaginationResponse {
    bans: Ban[]
}

export interface BirthdayMessage {
    id: number
    member: Member
    message: string
    date: Date | string
}

interface BirthdayMessageData extends PaginationResponse {
    birthdayMessages: BirthdayMessage[]
}

export interface TwitchChannel {
    member: Member
    channelName: string
    live: boolean
}

interface TwitchChannelData extends PaginationResponse {
    twitchChannels: TwitchChannel[]
}

export interface CubeStalkerRequest {
    id: number
    member: Member
    status: MemberCardStatus
}

interface CubeStalkerRequestData extends PaginationResponse {
    requests: CubeStalkerRequest[]
}

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    constructor(private http: HttpClient) {}

    getBirthdays(
        first: number,
        rows: number,
        sortField: string,
        sortOrder: number,
        filters: { [s: string]: FilterMetadata | undefined }
    ) {
        return this.http.get<BirthdayData>('/api/admin/birthdays', {
            params: {
                first,
                rows,
                sortField,
                sortOrder,
                filters: JSON.stringify(filters)
            }
        })
    }

    getMutes(
        first: number,
        rows: number,
        sortField: string,
        sortOrder: number,
        filters: { [s: string]: FilterMetadata | undefined }
    ) {
        return this.http.get<MuteData>('/api/admin/mutes', {
            params: {
                first,
                rows,
                sortField,
                sortOrder,
                filters: JSON.stringify(filters)
            }
        })
    }

    getBans(
        first: number,
        rows: number,
        sortField: string,
        sortOrder: number,
        filters: { [s: string]: FilterMetadata | undefined }
    ) {
        return this.http.get<BanData>('/api/admin/bans', {
            params: {
                first,
                rows,
                sortField,
                sortOrder,
                filters: JSON.stringify(filters)
            }
        })
    }

    getBirthdayMessages(
        first: number,
        rows: number,
        sortField: string,
        sortOrder: number,
        filters: { [s: string]: FilterMetadata | undefined }
    ) {
        return this.http.get<BirthdayMessageData>(
            '/api/admin/birthdayMessages',
            {
                params: {
                    first,
                    rows,
                    sortField,
                    sortOrder,
                    filters: JSON.stringify(filters)
                }
            }
        )
    }

    addBirthdayMessage(message: string) {
        return this.http.put('/api/admin/birthdayMessage', {
            message
        })
    }

    modifyBirthdayMessage(id: number, message: string) {
        return this.http.patch('/api/admin/birthdayMessage', {
            id,
            message
        })
    }

    deleteBirthdayMessage(id: number) {
        return this.http.delete('/api/admin/birthdayMessage', {
            body: {
                id
            }
        })
    }

    getTwitchChannels(
        first: number,
        rows: number,
        sortField: string,
        sortOrder: number,
        filters: { [s: string]: FilterMetadata | undefined }
    ) {
        return this.http.get<TwitchChannelData>('/api/admin/twitchChannels', {
            params: {
                first,
                rows,
                sortField,
                sortOrder,
                filters: JSON.stringify(filters)
            }
        })
    }

    getCubeStalkerRequests(
        first: number,
        rows: number,
        sortField: string,
        sortOrder: number,
        filters: { [s: string]: FilterMetadata | undefined }
    ) {
        return this.http.get<CubeStalkerRequestData>(
            '/api/admin/cubeStalkerRequests',
            {
                params: {
                    first,
                    rows,
                    sortField,
                    sortOrder,
                    filters: JSON.stringify(filters)
                }
            }
        )
    }

    getCubeStalkerRequest(id: number) {
        return this.http.get<CubeStalkerRequest | null>(
            '/api/admin/cubeStalkerRequest',
            {
                params: {
                    id
                }
            }
        )
    }

    denyCubeStalkerRequest(memberId: string) {
        return this.http.post('/api/admin/denyCubeStalkerRequest', {
            memberId
        })
    }

    approveCubeStalkerRequest(memberId: string) {
        return this.http.post('/api/admin/approveCubeStalkerRequest', {
            memberId
        })
    }
}
