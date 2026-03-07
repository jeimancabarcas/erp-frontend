import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TablerIconsModule } from 'angular-tabler-icons';
import { lastValueFrom } from 'rxjs';

import { BillingProduct } from '../../../../core/domain/entities/billing-product.entity';
import { GetBillingProductsUseCase } from '../../../../core/application/use-cases/get-billing-products.use-case';
import { DeleteBillingProductUseCase } from '../../../../core/application/use-cases/delete-billing-product.use-case';
import { ToastService } from '../../../../core/services/toast.service';
import { TableEmptyComponent } from '../../../../shared/components/table-empty/table-empty.component';
import { TableLoadingComponent } from '../../../../shared/components/table-loading/table-loading.component';
import { BillingProductFormComponent } from '../billing-product-form/billing-product-form.component';

@Component({
  selector: 'app-product-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    TablerIconsModule,
    TableEmptyComponent,
    TableLoadingComponent
  ],
  templateUrl: './product-settings.component.html',
  styleUrl: './product-settings.component.scss'
})
export class ProductSettingsComponent implements OnInit {
  private getBillingProductsUseCase = inject(GetBillingProductsUseCase);
  private deleteBillingProductUseCase = inject(DeleteBillingProductUseCase);
  private toast = inject(ToastService);
  private dialog = inject(MatDialog);

  public products = signal<BillingProduct[]>([]);
  public isProductsLoading = signal(false);
  public productColumns = ['name', 'codes', 'tax', 'price', 'inventoryLink', 'actions'];

  ngOnInit() {
    this.loadProducts();
  }

  private loadProducts() {
    this.isProductsLoading.set(true);
    this.getBillingProductsUseCase.execute().subscribe({
      next: (data) => {
        this.products.set(data);
        this.isProductsLoading.set(false);
      },
      error: (err) => {
        this.toast.error('Error al cargar productos de facturación');
        console.error(err);
        this.isProductsLoading.set(false);
      }
    });
  }

  openProductForm(product?: BillingProduct) {
    const dialogRef = this.dialog.open(BillingProductFormComponent, {
      width: '500px',
      data: product,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadProducts();
      }
    });
  }

  async deleteProduct(product: BillingProduct) {
    if (confirm(`¿Estás seguro de eliminar el producto "${product.name}"?`)) {
      try {
        await lastValueFrom(this.deleteBillingProductUseCase.execute(product.id));
        this.toast.success('Producto eliminado correctamente');
        this.loadProducts();
      } catch (err: any) {
        this.toast.error('Error al eliminar el producto');
      }
    }
  }
}
