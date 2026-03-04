import { Component, OnInit, signal, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MaterialModule } from '../../../material.module';
import { TableEmptyComponent } from '../../../shared/components/table-empty/table-empty.component';

export interface Sale {
    id: string;
    invoiceNumber: string;
    clientName: string;
    date: Date;
    amount: number;
    status: 'Emitida' | 'Pagada' | 'Rechazada';
}

const MOCK_SALES: Sale[] = [
    { id: '1', invoiceNumber: 'INV-001', clientName: 'Empresa Alpha S.A.', date: new Date('2023-10-01T10:00:00'), amount: 1500.50, status: 'Pagada' },
    { id: '2', invoiceNumber: 'INV-002', clientName: 'Juan Pérez', date: new Date('2023-10-02T14:30:00'), amount: 350.00, status: 'Emitida' },
    { id: '3', invoiceNumber: 'INV-003', clientName: 'Servicios Globales', date: new Date('2023-10-05T09:15:00'), amount: 2450.75, status: 'Rechazada' },
    { id: '4', invoiceNumber: 'INV-004', clientName: 'María García', date: new Date('2023-10-08T16:45:00'), amount: 120.00, status: 'Pagada' },
    { id: '5', invoiceNumber: 'INV-005', clientName: 'Tech Solutions', date: new Date('2023-10-10T11:20:00'), amount: 5600.00, status: 'Emitida' },
    { id: '6', invoiceNumber: 'INV-006', clientName: 'Carlos López', date: new Date('2023-10-12T08:00:00'), amount: 890.20, status: 'Pagada' },
    { id: '7', invoiceNumber: 'INV-007', clientName: 'Constructora Beta', date: new Date('2023-10-15T15:10:00'), amount: 3400.00, status: 'Rechazada' },
];

@Component({
    selector: 'app-sales',
    standalone: true,
    imports: [
        CommonModule,
        MaterialModule,
        TablerIconsModule,
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        TableEmptyComponent,
    ],
    templateUrl: './sales.component.html',
    styles: [`
        .filter-container {
            display: flex;
            gap: 16px;
            margin-bottom: 24px;
            flex-wrap: wrap;
        }
        .filter-field {
            flex: 1;
            min-width: 200px;
        }
        ::ng-deep .filter-field .mat-mdc-form-field-text-prefix {
            display: flex;
            align-items: center;
        }
    `]
})
export class SalesComponent implements OnInit {
    public dialog = inject(MatDialog);

    protected displayedColumns: string[] = ['invoiceNumber', 'clientName', 'date', 'amount', 'status', 'actions'];
    protected dataSource = new MatTableDataSource<Sale>([]);

    // UI State
    protected filterValue = '';
    protected statusFilter = 'Todas';
    protected statuses = ['Todas', 'Emitida', 'Pagada', 'Rechazada'];

    // Pagination
    protected totalElements = signal(0);
    protected pageSize = signal(5);
    protected currentPage = signal(0);

    @ViewChild(MatPaginator, { static: true }) protected paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) protected sort: MatSort;

    ngOnInit(): void {
        this.loadSales();
    }

    protected loadSales() {
        let filtered = MOCK_SALES;

        // Apply string filter
        if (this.filterValue.trim()) {
            const search = this.filterValue.trim().toLowerCase();
            filtered = filtered.filter(s =>
                s.invoiceNumber.toLowerCase().includes(search) ||
                s.clientName.toLowerCase().includes(search)
            );
        }

        // Apply status filter
        if (this.statusFilter !== 'Todas') {
            filtered = filtered.filter(s => s.status === this.statusFilter);
        }

        this.totalElements.set(filtered.length);

        // Apply pagination
        const startIndex = this.currentPage() * this.pageSize();
        const paginated = filtered.slice(startIndex, startIndex + this.pageSize());

        this.dataSource.data = paginated;
    }

    protected applyFilter() {
        this.currentPage.set(0);
        this.loadSales();
    }

    protected onStatusChange() {
        this.currentPage.set(0);
        this.loadSales();
    }

    protected onPageChange(event: PageEvent) {
        this.currentPage.set(event.pageIndex);
        this.pageSize.set(event.pageSize);
        this.loadSales();
    }

    protected onSortChange(sort: Sort) {
        // Implement client-side logic for mock data if needed, 
        // for now just reloading mock data order
        if (!sort.active || sort.direction === '') {
            this.loadSales();
            return;
        }

        MOCK_SALES.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            switch (sort.active) {
                case 'invoiceNumber': return this.compare(a.invoiceNumber, b.invoiceNumber, isAsc);
                case 'clientName': return this.compare(a.clientName, b.clientName, isAsc);
                case 'date': return this.compare(a.date.getTime(), b.date.getTime(), isAsc);
                case 'amount': return this.compare(a.amount, b.amount, isAsc);
                case 'status': return this.compare(a.status, b.status, isAsc);
                default: return 0;
            }
        });
        this.loadSales();
    }

    private compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    protected viewDetails(sale: Sale) {
        // Mock view details action
        console.log('Ver detalles de la factura:', sale.invoiceNumber);
    }

    protected newSale() {
        // Mock new sale action
        console.log('Crear nueva venta');
    }
}
