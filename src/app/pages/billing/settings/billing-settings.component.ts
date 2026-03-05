import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TablerIconsModule } from 'angular-tabler-icons';
import { TranslateModule } from '@ngx-translate/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { BillingProduct } from '../../../core/domain/entities/billing-product.entity';
import { GetBillingProductsUseCase } from '../../../core/application/use-cases/get-billing-products.use-case';
import { DeleteBillingProductUseCase } from '../../../core/application/use-cases/delete-billing-product.use-case';
import { BillingProductFormComponent } from './billing-product-form/billing-product-form.component';
import { BillingServiceFormComponent } from './billing-service-form/billing-service-form.component';
import { BillingService } from '../../../core/domain/entities/billing-service.entity';
import { GetBillingServicesUseCase } from '../../../core/application/use-cases/get-billing-services.use-case';
import { DeleteBillingServiceUseCase } from '../../../core/application/use-cases/delete-billing-service.use-case';
import { ToastService } from '../../../core/services/toast.service';
import { lastValueFrom } from 'rxjs';
import { TableEmptyComponent } from '../../../shared/components/table-empty/table-empty.component';
import { TableLoadingComponent } from '../../../shared/components/table-loading/table-loading.component';

export interface Client { id: string; name: string; email: string; phone: string; status: string; }
export interface PaymentMethod { id: string; name: string; details: string; status: string; }
export interface Tax { id: string; name: string; rate: number; }

@Component({
    selector: 'app-billing-settings',
    standalone: true,
    imports: [
        CommonModule,
        MatTabsModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        TablerIconsModule,
        TranslateModule,
        MatSlideToggleModule,
        MatDialogModule,
        TableEmptyComponent,
        TableLoadingComponent
    ],
    templateUrl: './billing-settings.component.html'
})
export class BillingSettingsComponent implements OnInit {

    private getBillingProductsUseCase = inject(GetBillingProductsUseCase);
    private deleteBillingProductUseCase = inject(DeleteBillingProductUseCase);
    private getBillingServicesUseCase = inject(GetBillingServicesUseCase);
    private deleteBillingServiceUseCase = inject(DeleteBillingServiceUseCase);
    private toast = inject(ToastService);
    public dialog = inject(MatDialog);

    // Mock Data
    public clients = signal<Client[]>([
        { id: '1', name: 'Empresa Alpha S.A.', email: 'contacto@alpha.com', phone: '123-456-7890', status: 'Activo' },
        { id: '2', name: 'Juan Pérez', email: 'juan.perez@email.com', phone: '098-765-4321', status: 'Inactivo' },
        { id: '3', name: 'Servicios Globales', email: 'admin@globales.net', phone: '555-123-4567', status: 'Activo' }
    ]);

    public paymentMethods = signal<PaymentMethod[]>([
        { id: '1', name: 'Transferencia Bancaria', details: 'Banco Nacional Cta. 12345', status: 'Activo' },
        { id: '2', name: 'Tarjeta de Crédito', details: 'Stripe Gateway', status: 'Activo' },
        { id: '3', name: 'Efectivo', details: 'Pago en caja', status: 'Activo' }
    ]);

    public taxes = signal<Tax[]>([
        { id: '1', name: 'IVA General', rate: 19 },
        { id: '2', name: 'IVA Reducido', rate: 5 },
        { id: '3', name: 'Retención en la Fuente', rate: -2.5 }
    ]);

    public services = signal<BillingService[]>([]);
    public isServicesLoading = signal(false);
    private isServicesLoaded = false;

    public products = signal<BillingProduct[]>([]);
    public isProductsLoading = signal(false);
    private isProductsLoaded = false;

    // Columns
    public clientColumns = ['name', 'email', 'phone', 'status', 'actions'];
    public paymentColumns = ['name', 'details', 'status', 'actions'];
    public taxColumns = ['name', 'rate', 'actions'];
    public serviceColumns = ['name', 'codes', 'price', 'actions'];
    public productColumns = ['name', 'codes', 'price', 'inventoryLink', 'actions'];

    ngOnInit() {
        // No pre-loading, petitions are intentionally lazy-loaded on tab change
    }

    onTabChange(event: MatTabChangeEvent) {
        // Tab index 3 is the "Servicios" tab
        if (event.index === 3 && !this.isServicesLoaded) {
            this.loadServices();
            this.isServicesLoaded = true;
        }
        // Tab index 4 is the "Productos" tab
        if (event.index === 4 && !this.isProductsLoaded) {
            this.loadProducts();
            this.isProductsLoaded = true;
        }
    }

    private loadServices() {
        this.isServicesLoading.set(true);
        this.getBillingServicesUseCase.execute().subscribe({
            next: (data) => {
                this.services.set(data);
                this.isServicesLoading.set(false);
            },
            error: (err) => {
                this.toast.error('Error al cargar servicios de facturación');
                console.error(err);
                this.isServicesLoading.set(false);
            }
        });
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

    // Placeholder actions
    edit(item: any) { console.log('Edit', item); }
    delete(item: any) { console.log('Delete', item); }
    linkInventory(item: BillingProduct) { console.log('Link to inventory', item); }

    // Real Action for Products
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

    // Real Action for Services
    openServiceForm(service?: BillingService) {
        const dialogRef = this.dialog.open(BillingServiceFormComponent, {
            width: '500px',
            data: service,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadServices();
            }
        });
    }

    async deleteService(service: BillingService) {
        if (confirm(`¿Estás seguro de eliminar el servicio "${service.name}"?`)) {
            try {
                await lastValueFrom(this.deleteBillingServiceUseCase.execute(service.id));
                this.toast.success('Servicio eliminado correctamente');
                this.loadServices();
            } catch (err: any) {
                this.toast.error('Error al eliminar el servicio');
            }
        }
    }
}
