import { ComponentFixture, TestBed } from '@angular/core/testing'

import { RankedleHistoriqueComponent } from './historique.component'

describe('RankedleHistoriqueComponent', () => {
    let component: RankedleHistoriqueComponent
    let fixture: ComponentFixture<RankedleHistoriqueComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RankedleHistoriqueComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(RankedleHistoriqueComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
