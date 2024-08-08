import { ComponentFixture, TestBed } from '@angular/core/testing'

import { RankedleClassementComponent } from './classement.component'

describe('RankedleClassementComponent', () => {
    let component: RankedleClassementComponent
    let fixture: ComponentFixture<RankedleClassementComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RankedleClassementComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(RankedleClassementComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
