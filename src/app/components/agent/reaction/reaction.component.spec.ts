import { ComponentFixture, TestBed } from '@angular/core/testing'

import { AgentReactionComponent } from './reaction.component'

describe('AgentReactionComponent', () => {
    let component: AgentReactionComponent
    let fixture: ComponentFixture<AgentReactionComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AgentReactionComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(AgentReactionComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
