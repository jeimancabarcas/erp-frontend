import { Component, Inject, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { TablerIconsModule } from 'angular-tabler-icons';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { BillingProduct } from '../../../../core/domain/entities/billing-product.entity';
import { Product as InventoryProduct } from '../../../../core/domain/entities/product.entity';
import { GetProductsUseCase } from '../../../../core/application/use-cases/get-products.use-case';
import { CreateBillingProductUseCase } from '../../../../core/application/use-cases/create-billing-product.use-case';
import { UpdateBillingProductUseCase } from '../../../../core/application/use-cases/update-billing-product.use-case';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
    selector: 'app-billing-product-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatTableModule,
        MatPaginatorModule,
        MatIconModule,
        TablerIconsModule
    ],
    templateUrl: './billing-product-form.component.html',
})
export class BillingProductFormComponent implements OnInit {
    public form: FormGroup;
    public isEditMode = false;

    // Dependencies
    private fb = inject(FormBuilder);
    private getProductsUseCase = inject(GetProductsUseCase);
    private createBillingProductUseCase = inject(CreateBillingProductUseCase);
    private updateBillingProductUseCase = inject(UpdateBillingProductUseCase);
    private toast = inject(ToastService);

    // Table state for Inventory Picker
    public inventoryColumns = ['sku', 'name', 'select'];
    public filteredInventoryProducts = signal<InventoryProduct[]>([]);
    public isSearchingInventory = signal(false);
    public totalInventoryProducts = signal(0);
    public currentInventoryPage = signal(1);

    // UI states
    public selectedInventoryProduct = signal<InventoryProduct | null>(null);
    public showInventoryTable = signal(false);

    constructor(
        public dialogRef: MatDialogRef<BillingProductFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data?: BillingProduct
    ) {
        this.isEditMode = !!(data && data.id);

        this.form = this.fb.group({
            standardCode: [data?.standardCode || ''],
            internalCode: [{ value: data?.internalCode || (data?.inventoryProductId ? data.inventoryProduct?.sku : ''), disabled: this.isEditMode || !!data?.inventoryProductId }, [Validators.required]],
            name: [{ value: data?.name || (data?.inventoryProductId ? data.inventoryProduct?.name : ''), disabled: !!data?.inventoryProductId }, [Validators.required]],
            price: [data?.price ?? '', [Validators.required, Validators.min(0)]],
            inventoryProductId: [data?.inventoryProductId || null],
            inventorySearch: ['']
        });

        // Initialize selected product state from edit mode if present
        if (data?.inventoryProductId && data?.inventoryProduct) {
            this.selectedInventoryProduct.set({
                id: data.inventoryProductId,
                name: data.inventoryProduct.name,
                sku: data.inventoryProduct.sku,
            } as any);
        }

        // Handle Autocomplete Search
        this.form.get('inventorySearch')?.valueChanges
            .pipe(
                debounceTime(300),
                distinctUntilChanged()
            )
            .subscribe(value => {
                if (typeof value === 'string' && value.trim().length > 0) {
                    this.searchInventoryProducts(value);
                } else if (typeof value === 'string') {
                    this.filteredInventoryProducts.set([]);
                }
            });
    }

    ngOnInit() {
        // If we are editing and it has a linked inventory product, we could fetch its name 
        // to display in the autocomplete. For simplicity in this mockup phase we will leave the search blank 
        // unless the user types again, but internal ID is retained.
    }

    public searchInventoryProducts(query: string = '', page: number = 1) {
        this.isSearchingInventory.set(true);
        this.currentInventoryPage.set(page);
        this.getProductsUseCase.execute({ search: query, limit: 5, page, excludeBillingLinked: true }).subscribe({
            next: (response) => {
                this.filteredInventoryProducts.set(response.products);
                this.totalInventoryProducts.set(response.total);
                this.isSearchingInventory.set(false);
            },
            error: () => {
                this.isSearchingInventory.set(false);
            }
        });
    }

    public onPageChange(event: PageEvent) {
        const query = this.form.get('inventorySearch')?.value || '';
        // event.pageIndex is 0-based, our API uses 1-based indexing
        this.searchInventoryProducts(query, event.pageIndex + 1);
    }

    public toggleInventoryTable() {
        this.showInventoryTable.set(!this.showInventoryTable());
        if (this.showInventoryTable() && this.filteredInventoryProducts().length === 0) {
            this.searchInventoryProducts(); // Load initial data
        }
    }

    public selectInventoryProduct(product: InventoryProduct) {
        this.selectedInventoryProduct.set(product);
        this.form.get('inventoryProductId')?.setValue(product.id);
        // Auto-fill and disable name and internal code
        this.form.get('name')?.setValue(product.name);
        this.form.get('name')?.disable();
        this.form.get('internalCode')?.setValue(product.sku);
        this.form.get('internalCode')?.disable();
        // Hide table upon selection
        this.showInventoryTable.set(false);
    }

    public unlinkInventoryProduct() {
        this.selectedInventoryProduct.set(null);
        this.form.get('inventoryProductId')?.setValue(null);
        this.form.get('name')?.enable();
        this.form.get('internalCode')?.setValue('');
        this.form.get('internalCode')?.enable();
        this.showInventoryTable.set(false);
    }

    public async onSubmit() {
        if (this.form.invalid) {
            Object.keys(this.form.controls).forEach(key => {
                this.form.get(key)?.markAsTouched();
            });
            return;
        }

        const formValue = this.form.getRawValue();

        // Build payload mapping required types
        const payload: Partial<BillingProduct> = {
            standardCode: formValue.standardCode,
            internalCode: formValue.inventoryProductId ? null : formValue.internalCode,
            name: formValue.inventoryProductId ? null : formValue.name,
            price: Number(formValue.price),
            inventoryProductId: formValue.inventoryProductId || null,
        };

        try {
            if (this.isEditMode && this.data?.id) {
                await new Promise((resolve, reject) => {
                    this.updateBillingProductUseCase.execute(this.data!.id, payload).subscribe({
                        next: (res) => resolve(res),
                        error: (err) => reject(err)
                    });
                });
                this.toast.success('Producto de facturación actualizado');
            } else {
                await new Promise((resolve, reject) => {
                    this.createBillingProductUseCase.execute(payload).subscribe({
                        next: (res) => resolve(res),
                        error: (err) => reject(err)
                    });
                });
                this.toast.success('Producto de facturación creado');
            }
            this.dialogRef.close(true);
        } catch (error) {
            this.toast.error('Ocurrió un error al guardar el producto');
            console.error(error);
        }
    }
}
