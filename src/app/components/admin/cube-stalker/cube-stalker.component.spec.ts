import { ComponentFixture, TestBed } from '@angular/core/testing'

import { AdminCubeStalkerComponent } from './cube-stalker.component'

describe('AdminCubeStalkerComponent', () => {
    let component: AdminCubeStalkerComponent
    let fixture: ComponentFixture<AdminCubeStalkerComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminCubeStalkerComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(AdminCubeStalkerComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
