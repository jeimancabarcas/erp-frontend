import { Component, OnInit, ViewChild, inject, signal, computed } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../material.module';
import { GetProductsUseCase } from '../../core/application/use-cases/get-products.use-case';
import { DeleteProductUseCase } from '../../core/application/use-cases/delete-product.use-case';
import { Product } from '../../core/domain/entities/product.entity';
import { lastValueFrom, debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductFormComponent } from './product-form.component';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

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
    public dialog = inject(MatDialog);

    protected displayedColumns: string[] = ['name', 'sku', 'category', 'stock', 'minStock', 'maxStock', 'actions'];
    protected dataSource = new MatTableDataSource<Product>([]);
    protected categories = signal<string[]>([]);

    protected filterValue = '';
    protected categoryFilter = '';
    protected categorySearchControl = new FormControl('');
    private debouncedCategorySearch = signal('');

    protected filteredCategoryOptions = computed(() => {
        const search = this.debouncedCategorySearch().toLowerCase();
        return this.categories().filter(c => c.toLowerCase().includes(search));
    });

    @ViewChild(MatPaginator, { static: true }) protected paginator: MatPaginator;
    @ViewChild(MatSort, { static: true }) protected sort: MatSort;

    ngOnInit(): void {
        this.loadProducts();
        this.categorySearchControl.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(value => {
            this.debouncedCategorySearch.set(value || '');
        });
    }

    async loadProducts() {
        const products = await lastValueFrom(this.getProductsUseCase.execute()) as Product[];
        this.dataSource.data = products;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        // Extract unique categories for filter
        const allCats = new Set<string>();
        products.forEach(p => p.categories?.forEach(c => allCats.add(c)));
        this.categories.set(Array.from(allCats).sort());

        // Setup custom filter
        this.dataSource.filterPredicate = (data: Product, filter: string) => {
            const searchTerms = JSON.parse(filter);
            const nameMatch = data.name.toLowerCase().includes(searchTerms.name.toLowerCase());
            const categoryMatch = searchTerms.category === '' ||
                (data.categories && data.categories.includes(searchTerms.category));
            return nameMatch && categoryMatch;
        };
    }

    protected applyFilter() {
        this.updateFilter();
    }

    protected onCategorySelected(event: MatAutocompleteSelectedEvent): void {
        this.categoryFilter = event.option.value as string;
        this.updateFilter();
    }

    protected clearCategoryFilter(): void {
        this.categorySearchControl.setValue('');
        this.categoryFilter = '';
        this.updateFilter();
    }

    protected applyCategoryFilter() {
        this.updateFilter();
    }

    private updateFilter() {
        const filterValues = {
            name: this.filterValue,
            category: this.categoryFilter
        };
        this.dataSource.filter = JSON.stringify(filterValues);
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    protected async deleteProduct(id: number) {
        if (confirm('¿Estás seguro de eliminar este producto?')) {
            await lastValueFrom(this.deleteProductUseCase.execute(id));
            this.loadProducts();
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
