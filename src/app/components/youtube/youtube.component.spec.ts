import { ComponentFixture, TestBed } from '@angular/core/testing'

import { YouTubeComponent } from './youtube.component'

describe('YouTubeComponent', () => {
    let component: YouTubeComponent
    let fixture: ComponentFixture<YouTubeComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [YouTubeComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(YouTubeComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
