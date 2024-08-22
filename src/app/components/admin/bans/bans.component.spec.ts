import { ComponentFixture, TestBed } from '@angular/core/testing'

import { AdminBansComponent } from './bans.component'

describe('AdminBansComponent', () => {
    let component: AdminBansComponent
    let fixture: ComponentFixture<AdminBansComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminBansComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(AdminBansComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
