import { ComponentFixture, TestBed } from '@angular/core/testing'

import { RankedleAideComponent } from './aide.component'

describe('RankedleAideComponent', () => {
    let component: RankedleAideComponent
    let fixture: ComponentFixture<RankedleAideComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RankedleAideComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(RankedleAideComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
