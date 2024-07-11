import { Component } from '@angular/core'
import { NgIf, AsyncPipe } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { CardModule } from 'primeng/card'
import { SkeletonModule } from 'primeng/skeleton'
import { MessagesModule } from 'primeng/messages'
import { DividerModule } from 'primeng/divider'
import { IconFieldModule } from 'primeng/iconfield'
import { InputIconModule } from 'primeng/inputicon'
import { InputTextModule } from 'primeng/inputtext'
import { DropdownModule } from 'primeng/dropdown'
import { InputTextareaModule } from 'primeng/inputtextarea'
import { SelectItem, SelectItemGroup, Message } from 'primeng/api'
import {
    YoutubeService,
    YouTubeVideo
} from '../../services/youtube/youtube.service'
import { trustResUrl } from '../../pipes/trustResUrl.pipe'

@Component({
    selector: 'app-youtube',
    standalone: true,
    imports: [
        NgIf,
        AsyncPipe,
        trustResUrl,
        CardModule,
        SkeletonModule,
        MessagesModule,
        FormsModule,
        ButtonModule,
        DividerModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        DropdownModule,
        InputTextareaModule
    ],
    templateUrl: './youtube.component.html',
    styleUrl: './youtube.component.scss'
})
export class YouTubeComponent {
    constructor(private youtubeService: YoutubeService) {}

    url: string = ''
    description: string = ''
    ldProfile: string = ''
    mapLd: string = ''
    beatsaverUrl: string = ''
    headset: number = 0
    grip: string = ''
    twitchUrl: string = ''
    comment: string = ''

    headsets: SelectItemGroup[] = [
        {
            label: 'HTC',
            value: 'HTC',
            items: [
                { label: 'HTC Vive', value: 1 },
                { label: 'HTC Vive Pro', value: 2 },
                { label: 'HTC Vive Pro 2', value: 3 }
            ]
        },
        {
            label: 'Oculus/Meta',
            value: 'Oculus/Meta',
            items: [
                { label: 'Oculus Quest', value: 4 },
                { label: 'Meta Quest 2', value: 5 },
                { label: 'Meta Quest 3', value: 6 },
                { label: 'Oculus Rift', value: 7 },
                { label: 'Oculus Rift S', value: 8 }
            ]
        },
        {
            label: 'Steam',
            value: 'Steam',
            items: [{ label: 'Valve Index', value: 9 }]
        },
        {
            label: 'Microsoft',
            value: 'Microsoft',
            items: [{ label: 'WMR - Windows Mixed Reality', value: 10 }]
        },
        {
            label: 'Autre',
            value: 'Autre',
            items: [{ label: 'Indiquez le en commentaire', value: 11 }]
        }
    ]

    grips: SelectItem[] = [
        { label: 'Default grip', value: 'Default grip' },
        {
            label: 'Default grip + Controllers settings',
            value: 'Default grip + Controllers settings'
        },
        { label: 'Claw grip', value: 'Claw grip' },
        { label: '2 Fingers Claw grip', value: '2 Fingers Claw grip' },
        { label: 'F-grip', value: 'F-grip' },
        { label: 'G-grip', value: 'G-grip' },
        { label: 'M-Grip', value: 'M-Grip' }
    ]

    commentMaxLength: number = 250
    commentCurrentLength: number = 0

    commentChange(event: KeyboardEvent) {
        const textarea = event.target as HTMLTextAreaElement
        this.commentCurrentLength = textarea.textLength
    }

    lastVideo: YouTubeVideo | null = null
    lastVideoLoading = true
    lastVideoNotFound: Message[] = [
        {
            severity: 'error',
            detail: 'Pas de vidéo trouvée',
            closable: false
        }
    ]

    ngOnInit() {
        this.youtubeService.getLastVideo().subscribe((res) => {
            this.lastVideoLoading = false
            this.lastVideo = res
        })
    }
}
