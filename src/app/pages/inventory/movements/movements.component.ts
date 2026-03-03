import { Component, OnInit, ViewChild, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { TablerIconsModule } from 'angular-tabler-icons';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { GetMovementsUseCase } from '../../../core/application/use-cases/get-movements.use-case';
import { GetMovementsMonthlyStatsUseCase } from '../../../core/application/use-cases/get-movements-monthly-stats.use-case';
import { Movement, MovementDirection, MovementType } from '../../../core/domain/entities/movement.entity';
import { MovementsQuery, MovementsListResponse } from '../../../core/domain/repositories/movement.repository';
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
    private getMonthlyStatsUseCase = inject(GetMovementsMonthlyStatsUseCase);
    private toast = inject(ToastService);
    public dialog = inject(MatDialog);

    protected displayedColumns = ['date', 'productId', 'direction', 'type', 'quantity', 'reference', 'notes'];
    protected dataSource = new MatTableDataSource<Movement>([]);

    // filter state (Server-side)
    protected searchControl = new FormControl('');
    protected directionControl = new FormControl('');
    protected typeControl = new FormControl('');

    // Pagination state
    protected totalElements = signal(0);
    protected currentPage = signal(0);
    protected pageSize = signal(10);

    private currentSort: Pick<MovementsQuery, 'sortBy' | 'sortOrder'> = {
        sortBy: 'date',
        sortOrder: 'desc'
    };

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

    @ViewChild(MatPaginator) protected paginator: MatPaginator;
    @ViewChild(MatSort) protected sort: MatSort;

    ngOnInit(): void {
        this.loadMovements();
        this.loadStats();

        this.searchControl.valueChanges.pipe(debounceTime(350), distinctUntilChanged())
            .subscribe(() => {
                this.currentPage.set(0);
                this.loadMovements();
            });

        this.directionControl.valueChanges.subscribe(() => {
            this.currentPage.set(0);
            this.loadMovements();
        });
        this.typeControl.valueChanges.subscribe(() => {
            this.currentPage.set(0);
            this.loadMovements();
        });
    }

    private loadStats() {
        this.getMonthlyStatsUseCase.execute().subscribe({
            next: (stats) => {
                this.totalMovements.set(stats.totalMovements);
                this.totalEntradas.set(stats.totalEntradas);
                this.totalSalidas.set(stats.totalSalidas);
            }
        });
    }

    protected loadMovements() {
        this.isLoading.set(true);

        const query: MovementsQuery = {
            search: this.searchControl.value || undefined,
            direction: (this.directionControl.value as any) || undefined,
            type: (this.typeControl.value as any) || undefined,
            sortBy: this.currentSort.sortBy,
            sortOrder: this.currentSort.sortOrder,
            page: this.currentPage() + 1, // backend is 1-indexed
            limit: this.pageSize()
        };

        this.getMovementsUseCase.execute(query).subscribe({
            next: (data: MovementsListResponse) => {
                this.dataSource.data = data.movements;
                this.totalElements.set(data.total);
                this.isLoading.set(false);
            },
            error: () => {
                this.toast.error('Error al cargar movimientos');
                this.isLoading.set(false);
            }
        });
    }

    protected onPageChange(event: PageEvent) {
        this.currentPage.set(event.pageIndex);
        this.pageSize.set(event.pageSize);
        this.loadMovements();
    }

    protected onSortChange(sort: Sort) {
        if (sort.active && sort.direction) {
            const fieldMap: Record<string, MovementsQuery['sortBy']> = {
                date: 'date',
                productId: 'productName',
                direction: 'date',
                type: 'date',
                quantity: 'quantity',
            };
            this.currentSort = {
                sortBy: fieldMap[sort.active] || 'date',
                sortOrder: sort.direction as 'asc' | 'desc',
            };
        } else {
            this.currentSort = { sortBy: 'date', sortOrder: 'desc' };
        }
        this.loadMovements();
    }

    protected clearFilters(): void {
        this.searchControl.setValue('');
        this.directionControl.setValue('');
        this.typeControl.setValue('');
        this.currentPage.set(0);
        this.loadMovements();
    }

    protected openMovementForm() {
        const dialogRef = this.dialog.open(MovementFormDialogComponent, {
            width: '600px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadMovements();
                this.loadStats();
            }
        });
    }
}
