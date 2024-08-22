import { ComponentFixture, TestBed } from '@angular/core/testing'

import { AdminCubeStalkerRequestComponent } from './request.component'

describe('AdminCubeStalkerRequestComponent', () => {
    let component: AdminCubeStalkerRequestComponent
    let fixture: ComponentFixture<AdminCubeStalkerRequestComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminCubeStalkerRequestComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(AdminCubeStalkerRequestComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
