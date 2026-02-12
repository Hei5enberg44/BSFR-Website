import { Component, signal } from '@angular/core'
import {
    FormsModule,
    ReactiveFormsModule,
    FormGroup,
    FormControl,
    Validators
} from '@angular/forms'
import { ButtonModule } from 'primeng/button'
import { CardModule } from 'primeng/card'
import { SkeletonModule } from 'primeng/skeleton'
import { Message } from 'primeng/message'
import { DividerModule } from 'primeng/divider'
import { IconFieldModule } from 'primeng/iconfield'
import { InputIconModule } from 'primeng/inputicon'
import { InputTextModule } from 'primeng/inputtext'
import { Select } from 'primeng/select'
import { TextareaModule } from 'primeng/textarea'
import { SelectItem, SelectItemGroup, ToastMessageOptions } from 'primeng/api'
import { ToastService } from '../../services/toast/toast.service'
import {
    YoutubeService,
    YouTubeVideo,
    RunForm
} from '../../services/youtube/youtube.service'
import { trustResUrl } from '../../pipes/trustResUrl.pipe'
import { finalize } from 'rxjs'

@Component({
    selector: 'app-youtube',
    imports: [
        trustResUrl,
        CardModule,
        SkeletonModule,
        Message,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
        DividerModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        Select,
        TextareaModule
    ],
    templateUrl: './youtube.component.html',
    styleUrl: './youtube.component.scss'
})
export class YouTubeComponent {
    constructor(
        private youtubeService: YoutubeService,
        private toastService: ToastService
    ) {}

    ytForm = new FormGroup({
        url: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required),
        ldProfile: new FormControl('', Validators.required),
        mapLd: new FormControl('', Validators.required),
        beatsaverUrl: new FormControl('', Validators.required),
        headset: new FormControl(0, Validators.required),
        grip: new FormControl('', Validators.required),
        twitchUrl: new FormControl(''),
        comment: new FormControl('')
    })

    runSubmitLoading = signal(false)

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

    lastVideo = signal<YouTubeVideo | null>(null)
    lastVideoLoading = signal(true)
    lastVideoNotFound: ToastMessageOptions = {
        severity: 'error',
        icon: 'pi pi-times-circle',
        detail: 'Pas de vidéo trouvée',
        closable: false
    }

    ngOnInit() {
        this.youtubeService.getLastVideo().subscribe((res) => {
            this.lastVideoLoading.set(false)
            this.lastVideo.set(res)
        })
    }

    onSubmit() {
        this.runSubmitLoading.set(true)
        this.youtubeService
            .submitRun(this.ytForm.value as RunForm)
            .pipe(
                finalize(() => {
                    this.runSubmitLoading.set(false)
                })
            )
            .subscribe(() => {
                this.ytForm.reset()
                this.toastService.showSuccess('Votre run a bien été envoyée.')
            })
    }
}
