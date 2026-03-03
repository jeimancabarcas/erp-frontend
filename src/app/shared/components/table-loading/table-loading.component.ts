import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-table-loading',
    standalone: true,
    imports: [MatProgressSpinnerModule],
    template: `
        <div style="display:flex; align-items:center; justify-content:center; gap:12px; padding:40px 0; width:100%;">
            <mat-spinner [diameter]="diameter()"></mat-spinner>
            <span style="font-size:14px; color:var(--mat-sys-on-surface-variant, #666);">
                {{ message() }}
            </span>
        </div>
    `,
})
export class TableLoadingComponent {
    readonly message = input('Cargando…');
    readonly diameter = input(28);
}
