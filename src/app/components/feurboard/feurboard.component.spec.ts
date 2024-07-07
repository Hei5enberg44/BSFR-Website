import { ComponentFixture, TestBed } from '@angular/core/testing'

import { FeurboardComponent } from './feurboard.component'

describe('FeurboardComponent', () => {
    let component: FeurboardComponent
    let fixture: ComponentFixture<FeurboardComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeurboardComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(FeurboardComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
