import { TestBed } from '@angular/core/testing'

import { BeatsaberService } from './beatsaber.service'

describe('BeatsaberService', () => {
    let service: BeatsaberService

    beforeEach(() => {
        TestBed.configureTestingModule({})
        service = TestBed.inject(BeatsaberService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
