import { Component, OnInit, ViewChild, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { GetMovementsUseCase } from '../../../core/application/use-cases/get-movements.use-case';
import { Movement, MovementDirection, MovementType } from '../../../core/domain/entities/movement.entity';
import { ToastService } from '../../../core/services/toast.service';
import { MatDialog } from '@angular/material/dialog';
import { MovementFormDialogComponent } from './movement-form-dialog.component';
import { TableLoadingComponent } from '../../../shared/components/table-loading/table-loading.component';
import { TableEmptyComponent } from '../../../shared/components/table-empty/table-empty.component';

@Component({
    selector: 'app-movements',
    standalone: true,
    imports: [CommonModule, MaterialModule, TablerIconsModule, TranslateModule, FormsModule, ReactiveFormsModule, TableLoadingComponent, TableEmptyComponent],
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
        .badge-sistema  { background: #ECEFF1; color: #455A64; }
    `]
})
export class MovementsComponent implements OnInit {
    private getMovementsUseCase = inject(GetMovementsUseCase);
    private toast = inject(ToastService);
    public dialog = inject(MatDialog);

    protected displayedColumns = ['date', 'productId', 'direction', 'type', 'quantity', 'reference', 'notes'];
    protected dataSource = new MatTableDataSource<Movement>([]);

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
    ];

    // summary stats
    protected totalEntradas = signal(0);
    protected totalSalidas = signal(0);
    protected totalMovements = signal(0);

    protected isLoading = signal(false);

    @ViewChild(MatPaginator, { static: true }) protected paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) protected sort: MatSort;

    ngOnInit(): void {
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.dataSource.filterPredicate = (data: Movement, filter: string) => {
            const f = JSON.parse(filter);
            const searchStr = (f.search || '').toLowerCase();
            const productName = (data.productName || '').toLowerCase();
            const productSku = (data.productSku || '').toLowerCase();
            const reference = (data.reference || '').toLowerCase();

            const searchMatch = !f.search ||
                productName.includes(searchStr) ||
                productSku.includes(searchStr) ||
                reference.includes(searchStr);

            const directionMatch = !f.direction || data.direction === f.direction;
            const typeMatch = !f.type || data.type === f.type;
            return !!(searchMatch && directionMatch && typeMatch);
        };

        this.loadMovements();

        this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
            .subscribe(v => { this.debouncedSearch.set(v?.toLowerCase() || ''); this.applyFilters(); });

        this.directionControl.valueChanges.subscribe(v => { this.directionFilter.set(v || ''); this.applyFilters(); });
        this.typeControl.valueChanges.subscribe(v => { this.typeFilter.set(v || ''); this.applyFilters(); });
    }

    private loadMovements() {
        this.isLoading.set(true);
        this.getMovementsUseCase.execute().subscribe({
            next: (data: Movement[]) => {
                this.dataSource.data = data;
                this.totalMovements.set(data.length);
                this.totalEntradas.set(data.filter((m: Movement) => m.direction === 'entrada').reduce((acc: number, m: Movement) => acc + m.quantity, 0));
                this.totalSalidas.set(data.filter((m: Movement) => m.direction === 'salida').reduce((acc: number, m: Movement) => acc + m.quantity, 0));
                this.isLoading.set(false);
            },
            error: () => {
                this.toast.error('Error al cargar movimientos');
                this.isLoading.set(false);
            }
        });
    }

    protected applyFilters(): void {
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

    protected openMovementForm() {
        const dialogRef = this.dialog.open(MovementFormDialogComponent, {
            width: '600px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadMovements();
            }
        });
    }
}
