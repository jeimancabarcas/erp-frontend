import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { TablerIconsModule } from 'angular-tabler-icons';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../material.module';
import { GetProductsUseCase } from '../../core/application/use-cases/get-products.use-case';
import { DeleteProductUseCase } from '../../core/application/use-cases/delete-product.use-case';
import { Product } from '../../core/domain/entities/product.entity';
import { lastValueFrom } from 'rxjs';
import { ProductFormComponent } from './product-form.component';

@Component({
    selector: 'app-inventory-list',
    standalone: true,
    imports: [
        CommonModule,
        MaterialModule,
        MatTableModule,
        MatPaginatorModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
        TablerIconsModule,
        TranslateModule,
    ],
    templateUrl: './inventory-list.component.html',
})
export class InventoryListComponent implements OnInit {
    private getProductsUseCase = inject(GetProductsUseCase);
    private deleteProductUseCase = inject(DeleteProductUseCase);
    public dialog = inject(MatDialog);

    protected displayedColumns: string[] = ['name', 'category', 'price', 'stock', 'actions'];
    protected dataSource = new MatTableDataSource<Product>([]);

    @ViewChild(MatPaginator, { static: true }) protected paginator: MatPaginator;

    ngOnInit(): void {
        this.loadProducts();
    }

    async loadProducts() {
        const products = await lastValueFrom(this.getProductsUseCase.execute()) as Product[];
        this.dataSource.data = products;
        this.dataSource.paginator = this.paginator;
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
