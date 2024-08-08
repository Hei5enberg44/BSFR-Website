import { ComponentFixture, TestBed } from '@angular/core/testing'

import { RankedleStatistiquesComponent } from './statistiques.component'

describe('RankedleStatistiquesComponent', () => {
    let component: RankedleStatistiquesComponent
    let fixture: ComponentFixture<RankedleStatistiquesComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RankedleStatistiquesComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(RankedleStatistiquesComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
