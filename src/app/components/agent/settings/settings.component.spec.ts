import { ComponentFixture, TestBed } from '@angular/core/testing'

import { AgentSettingsComponent } from './settings.component'

describe('AgentSettingsComponent', () => {
    let component: AgentSettingsComponent
    let fixture: ComponentFixture<AgentSettingsComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AgentSettingsComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(AgentSettingsComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
