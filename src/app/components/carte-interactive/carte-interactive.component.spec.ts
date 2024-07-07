import { ComponentFixture, TestBed } from '@angular/core/testing'

import { CarteInteractiveComponent } from './carte-interactive.component'

describe('CarteInteractiveComponent', () => {
    let component: CarteInteractiveComponent
    let fixture: ComponentFixture<CarteInteractiveComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CarteInteractiveComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(CarteInteractiveComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
