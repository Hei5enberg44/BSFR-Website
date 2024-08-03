import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
    name: 'stringify',
    standalone: true
})
export class stringifyPipe implements PipeTransform {
    transform(val: any) {
        return typeof val === 'object' ? JSON.stringify(val) : val
    }
}
