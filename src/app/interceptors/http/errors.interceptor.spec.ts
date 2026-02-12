import { TestBed } from '@angular/core/testing'
import { HttpInterceptorFn } from '@angular/common/http'

import { HttpErrorsInterceptor } from './errors.interceptor'

describe('testInterceptor', () => {
    const interceptor: HttpInterceptorFn = (req, next) =>
        TestBed.runInInjectionContext(() => HttpErrorsInterceptor(req, next))

    beforeEach(() => {
        TestBed.configureTestingModule({})
    })

    it('should be created', () => {
        expect(interceptor).toBeTruthy()
    })
})
