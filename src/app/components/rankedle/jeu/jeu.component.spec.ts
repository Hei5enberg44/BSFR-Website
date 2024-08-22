import { ComponentFixture, TestBed } from '@angular/core/testing'

import { RankedleJeuComponent } from './jeu.component'

describe('RankedleJeuComponent', () => {
    let component: RankedleJeuComponent
    let fixture: ComponentFixture<RankedleJeuComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RankedleJeuComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(RankedleJeuComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
