import { Component } from '@angular/core'
import { ToastModule } from 'primeng/toast'

@Component({
    selector: 'app-toast',
    imports: [ToastModule],
    templateUrl: './toast.component.html',
    styleUrl: './toast.component.scss'
})
export class ToastComponent {}
