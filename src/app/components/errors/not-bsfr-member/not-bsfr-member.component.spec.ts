import { ComponentFixture, TestBed } from '@angular/core/testing'

import { NotBsfrMemberComponent } from './not-bsfr-member.component'

describe('NotBsfrMemberComponent', () => {
    let component: NotBsfrMemberComponent
    let fixture: ComponentFixture<NotBsfrMemberComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NotBsfrMemberComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(NotBsfrMemberComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
