import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'round',
    standalone: true
})
export class roundPipe implements PipeTransform {
    transform(val: number) {
        return Math.round(val)
    }
}
