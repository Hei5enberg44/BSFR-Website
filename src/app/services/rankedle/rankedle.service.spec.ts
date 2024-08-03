import { TestBed } from '@angular/core/testing'

import { RankedleService } from './rankedle.service'

describe('RankedleService', () => {
    let service: RankedleService

    beforeEach(() => {
        TestBed.configureTestingModule({})
        service = TestBed.inject(RankedleService)
    })

    it('should be created', () => {
        expect(service).toBeTruthy()
    })
})
