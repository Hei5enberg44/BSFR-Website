import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ProfilTwitchComponent } from './twitch.component'

describe('ProfilTwitchComponent', () => {
    let component: ProfilTwitchComponent
    let fixture: ComponentFixture<ProfilTwitchComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProfilTwitchComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(ProfilTwitchComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
