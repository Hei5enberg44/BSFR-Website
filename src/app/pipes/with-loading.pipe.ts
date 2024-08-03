import { Pipe, PipeTransform } from '@angular/core'
import { Observable, isObservable, of } from 'rxjs'
import { map, startWith, catchError } from 'rxjs/operators'

@Pipe({
    name: 'withLoading',
    standalone: true
})
export class WithLoadingPipe implements PipeTransform {
    transform<T>(
        val: Observable<T>
    ): Observable<{ loading: boolean; value?: T; error?: unknown }> {
        return isObservable(val)
            ? val.pipe(
                  map((value: any) => ({ loading: false, value })),
                  startWith({ loading: true }),
                  catchError((error) => of({ loading: false, error }))
              )
            : val
    }
}
