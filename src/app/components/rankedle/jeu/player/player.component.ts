import { Component, Input, OnInit, SimpleChanges } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { CardModule } from 'primeng/card'
import { AvatarModule } from 'primeng/avatar'
import { SliderModule, SliderChangeEvent } from 'primeng/slider'
import { ButtonModule } from 'primeng/button'
declare var Howl: any

import { RankedleResultMap } from '../../../../services/rankedle/rankedle.service'
import { NgIf } from '@angular/common'

@Component({
    selector: 'app-audio-player',
    imports: [
        NgIf,
        FormsModule,
        CardModule,
        AvatarModule,
        SliderModule,
        ButtonModule
    ],
    templateUrl: './player.component.html',
    styleUrl: './player.component.scss'
})
export class AudioPlayerComponent implements OnInit {
    private playIcon = 'pi-play-circle text-[#3398db]'
    private stopIcon = 'pi-stop-circle animate-rankedlePlayBtn'

    private SKIPS = [1, 2, 3, 4, 5, 14, 0]

    audioPlayer: any
    isPlaying = false
    statusIcon = this.playIcon
    volume = 50
    progress = 0
    seek = 0
    elapsedTime = '00:00'

    @Input() barCount = 100
    @Input() barWidth = 8
    @Input() gap = 2
    @Input() skips = 6
    @Input() map: RankedleResultMap | null = null

    baseWaveformUrl = ''
    unlockedWaveformUrl = ''
    progressWaveformUrl = ''

    progressWaveformStyle = 'clip-path: polygon(0 0, 0% 0, 0% 100%, 0 100%)'
    unlockedWaveformStyle = 'clip-path: polygon(0 0, 0% 0, 0% 100%, 0 100%)'

    ngOnInit(): void {
        this.volume = this.getVolume()

        this.baseWaveformUrl = `/api/rankedle/song/waveform?type=base&barCount=${this.barCount}&barWidth=${this.barWidth}&gap=${this.gap}`
        this.unlockedWaveformUrl = `/api/rankedle/song/waveform?type=unlocked&barCount=${this.barCount}&barWidth=${this.barWidth}&gap=${this.gap}`
        this.progressWaveformUrl = `/api/rankedle/song/waveform?type=progress&barCount=${this.barCount}&barWidth=${this.barWidth}&gap=${this.gap}`

        this.init()
    }

    ngOnDestroy(): void {
        this.stop()
    }

    ngOnChanges(event: SimpleChanges) {
        if (event['skips'] && !event['skips'].firstChange) {
            this.updateUnlocked()
            this.play(true)
        }
    }

    init() {
        this.updateUnlocked()
    }

    playBtnClick() {
        if (!this.isPlaying) {
            this.play()
        } else {
            this.stop()
        }
    }

    setWaveformProgress(progress = 0) {
        this.progressWaveformStyle = `clip-path: polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`
    }

    createAudioPlayer() {
        this.audioPlayer = new Howl({
            src: `/api/rankedle/song/play?nocache=${Date.now()}`,
            format: ['mp3'],
            volume: this.volume / 100
        })
    }

    getVolume() {
        const volume = window.localStorage.getItem('rankedleVolume')
        return volume ? parseInt(volume) : 50
    }

    setVolume(event: SliderChangeEvent) {
        const volume = event.value as number
        window.localStorage.setItem('rankedleVolume', volume.toString())
        if (this.audioPlayer) this.audioPlayer.volume(volume / 100)
    }

    play(resume = false) {
        const currentTime = this.audioPlayer?.seek() || 0

        this.seek = 0

        this.audioPlayer?.unload()

        this.createAudioPlayer()

        this.audioPlayer.on('end', () => {
            this.reset()
        })

        const audioSeek = () => {
            const seek = this.audioPlayer.seek() || 0
            if (seek >= this.seek) this.seek = seek
            const progress = (this.seek * 100) / 30
            this.setWaveformProgress(progress)
            this.progress = requestAnimationFrame(audioSeek)
            const elapsed = Math.floor(this.seek)
            this.elapsedTime = `00:${elapsed < 10 ? `0${elapsed}` : elapsed}`
        }

        if (resume) {
            cancelAnimationFrame(this.progress)
            if (this.isPlaying) {
                this.audioPlayer.seek(currentTime)
                this.audioPlayer.play()
                this.progress = requestAnimationFrame(audioSeek)
                this.statusIcon = this.playIcon
            }
        } else {
            this.isPlaying = true
            this.audioPlayer.play()
            this.progress = requestAnimationFrame(audioSeek)
            this.statusIcon = this.stopIcon
        }
    }

    reset() {
        this.isPlaying = false
        cancelAnimationFrame(this.progress)
        this.setWaveformProgress(
            (Math.round(this.audioPlayer.duration()) * 100) / 30
        )
        const elapsed = Math.round(this.seek)
        this.elapsedTime = `00:${elapsed < 10 ? `0${elapsed}` : elapsed}`
        this.seek = 0
        this.statusIcon = this.playIcon
    }

    stop() {
        if (this.audioPlayer) {
            this.isPlaying = false
            this.audioPlayer.unload()
            cancelAnimationFrame(this.progress)
            this.statusIcon = this.playIcon
        }
    }

    updateUnlocked() {
        const skipedTotal =
            this.skips > 0
                ? [...this.SKIPS.slice(0, this.skips)].reduce((p, c) => p + c) +
                  1
                : 1
        this.unlockedWaveformStyle = `clip-path: polygon(0 0, ${(skipedTotal * 100) / 30}% 0, ${(skipedTotal * 100) / 30}% 100%, 0 100%)`
    }
}
