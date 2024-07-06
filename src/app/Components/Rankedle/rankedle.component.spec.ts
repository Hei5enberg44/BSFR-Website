import { ComponentFixture, TestBed } from '@angular/core/testing'

import { RankedleComponent } from './rankedle.component'

describe('RankedleComponent', () => {
    let component: RankedleComponent
    let fixture: ComponentFixture<RankedleComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RankedleComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(RankedleComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
