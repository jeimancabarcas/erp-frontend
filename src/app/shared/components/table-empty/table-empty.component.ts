import { Component, input } from '@angular/core';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
    selector: 'app-table-empty',
    standalone: true,
    imports: [TablerIconsModule],
    template: `
    <div class="flex flex-col items-center justify-center gap-2 p-4">
        <i-tabler [name]="icon()" style="opacity:0.35; color:var(--mat-sys-on-surface-variant, #999);"></i-tabler>
        <span style="font-size:14px; color:var(--mat-sys-on-surface-variant, #666);">
            {{ message() }}
        </span>
    </div>
    `,
})
export class TableEmptyComponent {
    readonly message = input('No hay registros');
    readonly icon = input('inbox');
}
