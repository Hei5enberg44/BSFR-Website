import { Pipe, PipeTransform } from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import type { FeatherIcon, FeatherAttributes } from 'feather-icons'

@Pipe({
    name: 'svg',
    standalone: true
})
export class svgPipe implements PipeTransform {
    constructor(private domSanitiser: DomSanitizer) {}

    transform(icon: FeatherIcon, size?: string) {
        const options: Partial<FeatherAttributes> = {}
        if(size) {
            options.width = size
            options.height = size
        }
        return this.domSanitiser.bypassSecurityTrustHtml(icon.toSvg(options))
    }
}
