import { ComponentFixture, TestBed } from '@angular/core/testing'

import { AdminMutesComponent } from './mutes.component'

describe('AdminMutesComponent', () => {
    let component: AdminMutesComponent
    let fixture: ComponentFixture<AdminMutesComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminMutesComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(AdminMutesComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
