import { ComponentFixture, TestBed } from '@angular/core/testing'

import { ProfilRolesComponent } from './roles.component'

describe('ProfilRolesComponent', () => {
    let component: ProfilRolesComponent
    let fixture: ComponentFixture<ProfilRolesComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProfilRolesComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(ProfilRolesComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
