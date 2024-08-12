import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ProfilAnniversaireComponent } from './anniversaire.component'

describe('ProfilAnniversaireComponent', () => {
    let component: ProfilAnniversaireComponent
    let fixture: ComponentFixture<ProfilAnniversaireComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProfilAnniversaireComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(ProfilAnniversaireComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
