import { Component, OnInit, ViewChild, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';

export type MovementDirection = 'entrada' | 'salida';
export type MovementType = 'compra' | 'venta' | 'manual';

export interface Movement {
    id: number;
    date: Date;
    product: string;
    sku: string;
    direction: MovementDirection;
    type: MovementType;
    quantity: number;
    unitCost: number;
    reference: string;
    notes: string;
}

const MOCK_MOVEMENTS: Movement[] = [
    { id: 1, date: new Date('2026-03-01T08:30:00'), product: 'Monitor 4K 27"', sku: 'MON-4K-27', direction: 'entrada', type: 'compra', quantity: 20, unitCost: 350, reference: 'OC-2026-001', notes: 'Reposición mensual' },
    { id: 2, date: new Date('2026-03-01T10:00:00'), product: 'Teclado Mecánico', sku: 'TEC-MEC-01', direction: 'salida', type: 'venta', quantity: 5, unitCost: 80, reference: 'FAC-2026-045', notes: '' },
    { id: 3, date: new Date('2026-03-01T11:45:00'), product: 'Mouse Inalámbrico', sku: 'MOU-INL-02', direction: 'salida', type: 'venta', quantity: 8, unitCost: 45, reference: 'FAC-2026-046', notes: '' },
    { id: 4, date: new Date('2026-03-01T14:00:00'), product: 'Auriculares BT', sku: 'AUR-BT-05', direction: 'entrada', type: 'compra', quantity: 15, unitCost: 60, reference: 'OC-2026-002', notes: 'Nuevo proveedor' },
    { id: 5, date: new Date('2026-03-01T16:30:00'), product: 'Webcam HD', sku: 'CAM-HD-03', direction: 'entrada', type: 'manual', quantity: 3, unitCost: 95, reference: 'AJU-001', notes: 'Corrección de inventario' },
    { id: 6, date: new Date('2026-03-02T09:00:00'), product: 'Monitor 4K 27"', sku: 'MON-4K-27', direction: 'salida', type: 'venta', quantity: 4, unitCost: 350, reference: 'FAC-2026-047', notes: '' },
    { id: 7, date: new Date('2026-03-02T10:30:00'), product: 'SSD 1TB', sku: 'SSD-1TB-07', direction: 'entrada', type: 'compra', quantity: 30, unitCost: 120, reference: 'OC-2026-003', notes: '' },
    { id: 8, date: new Date('2026-03-02T12:00:00'), product: 'Hub USB-C', sku: 'HUB-USC-04', direction: 'salida', type: 'venta', quantity: 10, unitCost: 35, reference: 'FAC-2026-048', notes: '' },
    { id: 9, date: new Date('2026-03-02T14:15:00'), product: 'Teclado Mecánico', sku: 'TEC-MEC-01', direction: 'salida', type: 'manual', quantity: 2, unitCost: 80, reference: 'AJU-002', notes: 'Merma por daño' },
    { id: 10, date: new Date('2026-03-02T16:00:00'), product: 'Mouse Inalámbrico', sku: 'MOU-INL-02', direction: 'entrada', type: 'compra', quantity: 25, unitCost: 45, reference: 'OC-2026-004', notes: '' },
];

@Component({
    selector: 'app-movements',
    standalone: true,
    imports: [CommonModule, MaterialModule, TablerIconsModule, TranslateModule, FormsModule, ReactiveFormsModule],
    templateUrl: './movements.component.html',
    styles: [`
        .filter-container {
            display: flex;
            gap: 16px;
            margin-bottom: 24px;
            flex-wrap: wrap;
        }
        .filter-field { flex: 1; min-width: 180px; }
        ::ng-deep .filter-field .mat-mdc-form-field-text-prefix {
            display: flex;
            align-items: center;
        }
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 10px;
            border-radius: 999px;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .badge-entrada  { background: var(--mat-sys-surface-variant, #E8F5E9); color: #2E7D32; }
        .badge-salida   { background: #FFEBEE; color: #C62828; }
        .badge-compra   { background: #E3F2FD; color: #1565C0; }
        .badge-venta    { background: #FFF3E0; color: #E65100; }
        .badge-manual   { background: #F3E5F5; color: #6A1B9A; }
    `]
})
export class MovementsComponent implements OnInit {
    protected displayedColumns = ['date', 'product', 'direction', 'type', 'quantity', 'unitCost', 'reference', 'notes'];
    protected dataSource = new MatTableDataSource<Movement>(MOCK_MOVEMENTS);

    // filter state
    protected searchControl = new FormControl('');
    protected directionControl = new FormControl('');
    protected typeControl = new FormControl('');

    private debouncedSearch = signal('');
    protected directionFilter = signal('');
    protected typeFilter = signal('');

    protected directionOptions: { value: MovementDirection | '', label: string }[] = [
        { value: '', label: 'Todas' },
        { value: 'entrada', label: 'Entrada' },
        { value: 'salida', label: 'Salida' },
    ];

    protected typeOptions: { value: MovementType | '', label: string }[] = [
        { value: '', label: 'Todos' },
        { value: 'compra', label: 'Compra' },
        { value: 'venta', label: 'Venta' },
        { value: 'manual', label: 'Manual' },
    ];

    // summary stats
    protected totalEntradas = computed(() =>
        MOCK_MOVEMENTS.filter(m => m.direction === 'entrada').reduce((sum, m) => sum + m.quantity, 0));
    protected totalSalidas = computed(() =>
        MOCK_MOVEMENTS.filter(m => m.direction === 'salida').reduce((sum, m) => sum + m.quantity, 0));
    protected totalMovements = MOCK_MOVEMENTS.length;

    @ViewChild(MatPaginator, { static: true }) protected paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) protected sort: MatSort;

    ngOnInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.dataSource.filterPredicate = (data: Movement, filter: string) => {
            const f = JSON.parse(filter);
            const searchMatch = !f.search || data.product.toLowerCase().includes(f.search) || data.reference.toLowerCase().includes(f.search);
            const directionMatch = !f.direction || data.direction === f.direction;
            const typeMatch = !f.type || data.type === f.type;
            return searchMatch && directionMatch && typeMatch;
        };

        this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
            .subscribe(v => { this.debouncedSearch.set(v?.toLowerCase() || ''); this.applyFilters(); });

        this.directionControl.valueChanges.subscribe(v => { this.directionFilter.set(v || ''); this.applyFilters(); });
        this.typeControl.valueChanges.subscribe(v => { this.typeFilter.set(v || ''); this.applyFilters(); });
    }

    private applyFilters(): void {
        this.dataSource.filter = JSON.stringify({
            search: this.debouncedSearch(),
            direction: this.directionFilter(),
            type: this.typeFilter(),
        });
        if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
    }

    protected clearFilters(): void {
        this.searchControl.setValue('');
        this.directionControl.setValue('');
        this.typeControl.setValue('');
    }
}
