import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ProfilVilleComponent } from './ville.component'

describe('ProfilVilleComponent', () => {
    let component: ProfilVilleComponent
    let fixture: ComponentFixture<ProfilVilleComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProfilVilleComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(ProfilVilleComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
