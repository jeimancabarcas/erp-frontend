import { Component, OnInit, ViewChild, inject, signal, computed } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../material.module';
import { GetProductsUseCase } from '../../core/application/use-cases/get-products.use-case';
import { DeleteProductUseCase } from '../../core/application/use-cases/delete-product.use-case';
import { Product } from '../../core/domain/entities/product.entity';
import { ProductsQuery } from '../../core/domain/repositories/product.repository';
import { lastValueFrom, debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { ProductFormComponent } from './product-form.component';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ToastService } from '../../core/services/toast.service';
import { TableLoadingComponent } from '../../shared/components/table-loading/table-loading.component';
import { TableEmptyComponent } from '../../shared/components/table-empty/table-empty.component';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-inventory-list',
    standalone: true,
    imports: [
        CommonModule,
        MaterialModule,
        TablerIconsModule,
        TranslateModule,
        FormsModule,
        ReactiveFormsModule,
        TableLoadingComponent,
        TableEmptyComponent,
    ],
    templateUrl: './inventory-list.component.html',
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
export class InventoryListComponent implements OnInit {
    private getProductsUseCase = inject(GetProductsUseCase);
    private deleteProductUseCase = inject(DeleteProductUseCase);
    private toast = inject(ToastService);
    public dialog = inject(MatDialog);

    protected displayedColumns: string[] = ['name', 'sku', 'category', 'stock', 'minStock', 'maxStock', 'actions'];
    protected dataSource = new MatTableDataSource<Product>([]);
    protected categories = signal<{ id: string; name: string }[]>([]);
    protected isLoading = signal(false);

    // Server-side query state
    protected filterValue = '';
    protected categoryFilter = '';
    protected categorySearchControl = new FormControl('');
    private currentSort: Pick<ProductsQuery, 'sortBy' | 'sortOrder'> = {};
    private searchSubject = new Subject<string>();
    private debouncedCategorySearch = signal('');

    protected filteredCategoryOptions = computed(() => {
        const search = this.debouncedCategorySearch().toLowerCase();
        return this.categories().filter(c => c.name.toLowerCase().includes(search));
    });

    @ViewChild(MatPaginator, { static: true }) protected paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) protected sort: MatSort;

    private route = inject(ActivatedRoute);

    ngOnInit(): void {
        const queryParams = this.route.snapshot.queryParams;
        if (queryParams['sortBy'] && queryParams['sortOrder']) {
            this.currentSort = {
                sortBy: queryParams['sortBy'],
                sortOrder: queryParams['sortOrder'],
            };
            // Set initial sort for UI visual indicator
            this.sort.active = queryParams['sortBy'];
            this.sort.direction = queryParams['sortOrder'];
        }

        // Debounce the search input — triggers server call after 350 ms of no typing
        this.searchSubject.pipe(debounceTime(350), distinctUntilChanged()).subscribe(() => {
            this.loadProducts();
        });

        this.categorySearchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(value => {
            this.debouncedCategorySearch.set(value || '');
        });

        this.loadProducts();
    }

    protected loadProducts() {
        this.isLoading.set(true);

        const query: ProductsQuery = {};
        if (this.filterValue.trim()) query.search = this.filterValue.trim();
        if (this.currentSort.sortBy) query.sortBy = this.currentSort.sortBy;
        if (this.currentSort.sortOrder) query.sortOrder = this.currentSort.sortOrder;

        this.getProductsUseCase.execute(query).subscribe({
            next: (products) => {
                // Client-side category filter (categories aren't searchable via backend yet)
                const filtered = this.categoryFilter
                    ? products.filter(p => p.categories?.some(c => c.id === this.categoryFilter))
                    : products;

                this.dataSource.data = filtered;
                this.dataSource.paginator = this.paginator;

                const allCatsMap = new Map<string, { id: string; name: string }>();
                products.forEach(p => p.categories?.forEach(c => allCatsMap.set(c.id, c)));
                const allCats = Array.from(allCatsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
                this.categories.set(allCats);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
            },
        });
    }

    protected applyFilter() {
        this.searchSubject.next(this.filterValue);
    }

    /** Triggered when MatSort header is clicked */
    protected onSortChange(sort: Sort) {
        if (sort.active && sort.direction) {
            const fieldMap: Record<string, ProductsQuery['sortBy']> = {
                name: 'name',
                sku: 'sku',
                stock: 'stock',
                minStock: 'minStock',
                maxStock: 'maxStock',
            };
            this.currentSort = {
                sortBy: fieldMap[sort.active],
                sortOrder: sort.direction as 'asc' | 'desc',
            };
        } else {
            this.currentSort = {};
        }
        this.loadProducts();
    }

    protected onCategorySelected(event: MatAutocompleteSelectedEvent): void {
        this.categoryFilter = event.option.value?.id || '';
        this.loadProducts();
    }

    displayCategory(category: { id: string; name: string }): string {
        return category && category.name && category.id !== '' ? category.name : '';
    }

    protected clearCategoryFilter(): void {
        this.categorySearchControl.setValue('');
        this.categoryFilter = '';
        this.loadProducts();
    }

    protected async deleteProduct(id: string) {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            try {
                await lastValueFrom(this.deleteProductUseCase.execute(id));
                this.toast.success('Producto eliminado correctamente');
                this.loadProducts();
            } catch (err: any) {
                this.toast.error('Error al eliminar el producto');
            }
        }
    }

    protected openProductForm(product?: Product) {
        const dialogRef = this.dialog.open(ProductFormComponent, {
            width: '500px',
            data: product,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadProducts();
            }
        });
    }
}
