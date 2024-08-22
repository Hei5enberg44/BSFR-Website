import { ComponentFixture, TestBed } from '@angular/core/testing'

import { AdminMessagesAnniversaireComponent } from './messages-anniversaire.component'

describe('AdminMessagesAnniversaireComponent', () => {
    let component: AdminMessagesAnniversaireComponent
    let fixture: ComponentFixture<AdminMessagesAnniversaireComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminMessagesAnniversaireComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(AdminMessagesAnniversaireComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
