import { ComponentFixture, TestBed } from '@angular/core/testing'

import { MultiPovComponent } from './multi-pov.component'

describe('MultiPovComponent', () => {
    let component: MultiPovComponent
    let fixture: ComponentFixture<MultiPovComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MultiPovComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(MultiPovComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
