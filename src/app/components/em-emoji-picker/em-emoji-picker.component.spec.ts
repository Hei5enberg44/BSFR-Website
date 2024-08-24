import { ComponentFixture, TestBed } from '@angular/core/testing'

import { EmEmojiPickerComponent } from './em-emoji-picker.component'

describe('EmEmojiPickerComponent', () => {
    let component: EmEmojiPickerComponent
    let fixture: ComponentFixture<EmEmojiPickerComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EmEmojiPickerComponent]
        }).compileComponents()

        fixture = TestBed.createComponent(EmEmojiPickerComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should create', () => {
        expect(component).toBeTruthy()
    })
})
