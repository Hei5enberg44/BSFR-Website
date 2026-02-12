import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ProfilCarteCubeStalkerComponent } from './carte-cube-stalker.component'

describe('ProfilCarteCubeStalkerComponent', () => {
    let component: ProfilCarteCubeStalkerComponent
    let fixture: ComponentFixture<ProfilCarteCubeStalkerComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProfilCarteCubeStalkerComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(ProfilCarteCubeStalkerComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
