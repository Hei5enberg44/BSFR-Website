import { ComponentFixture, TestBed } from '@angular/core/testing'

import { AdminAnniversairesComponent } from './anniversaires.component'

describe('AdminAnniversairesComponent', () => {
    let component: AdminAnniversairesComponent
    let fixture: ComponentFixture<AdminAnniversairesComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminAnniversairesComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(AdminAnniversairesComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
