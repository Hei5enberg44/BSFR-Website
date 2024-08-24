import { ComponentFixture, TestBed } from '@angular/core/testing'

import { AgentMessageComponent } from './message.component'

describe('AgentMessageComponent', () => {
    let component: AgentMessageComponent
    let fixture: ComponentFixture<AgentMessageComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AgentMessageComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(AgentMessageComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
