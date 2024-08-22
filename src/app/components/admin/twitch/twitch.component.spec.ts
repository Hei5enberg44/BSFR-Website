import { ComponentFixture, TestBed } from '@angular/core/testing'

import { AdminTwitchComponent } from './twitch.component'

describe('AdminBansComponent', () => {
    let component: AdminTwitchComponent
    let fixture: ComponentFixture<AdminTwitchComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AdminTwitchComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(AdminTwitchComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
