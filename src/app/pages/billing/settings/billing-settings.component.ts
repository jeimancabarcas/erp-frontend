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

// -- Taxes --
import { BillingTaxFormComponent } from './billing-tax-form/billing-tax-form.component';
import { BillingTax } from '../../../core/domain/entities/billing-tax.entity';
import { GetBillingTaxesUseCase } from '../../../core/application/use-cases/get-billing-taxes.use-case';
import { DeleteBillingTaxUseCase } from '../../../core/application/use-cases/delete-billing-tax.use-case';

// -- Payment Methods --
import { BillingPaymentMethodFormComponent } from './billing-payment-method-form/billing-payment-method-form.component';
import { BillingPaymentMethod } from '../../../core/domain/entities/billing-payment-method.entity';
import { GetBillingPaymentMethodsUseCase } from '../../../core/application/use-cases/get-billing-payment-methods.use-case';
import { DeleteBillingPaymentMethodUseCase } from '../../../core/application/use-cases/delete-billing-payment-method.use-case';

import { ToastService } from '../../../core/services/toast.service';
import { lastValueFrom } from 'rxjs';
import { TableEmptyComponent } from '../../../shared/components/table-empty/table-empty.component';
import { TableLoadingComponent } from '../../../shared/components/table-loading/table-loading.component';

// -- Clients --
import { BillingClientFormComponent } from './billing-client-form/billing-client-form.component';
import { BillingClient } from '../../../core/domain/entities/billing-client.entity';
import { GetBillingClientsUseCase } from '../../../core/application/use-cases/billing-client/get-billing-clients.use-case';
import { CreateBillingClientUseCase } from '../../../core/application/use-cases/billing-client/create-billing-client.use-case';
import { UpdateBillingClientUseCase } from '../../../core/application/use-cases/billing-client/update-billing-client.use-case';
import { DeleteBillingClientUseCase } from '../../../core/application/use-cases/billing-client/delete-billing-client.use-case';

// -- Preferences --
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GetBillingTemplatePreferencesUseCase } from '../../../core/application/use-cases/billing-template-preferences/get-billing-template-preferences.use-case';
import { UpdateBillingTemplatePreferencesUseCase } from '../../../core/application/use-cases/billing-template-preferences/update-billing-template-preferences.use-case';

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
        TableLoadingComponent,
        ReactiveFormsModule
    ],
    templateUrl: './billing-settings.component.html'
})
export class BillingSettingsComponent implements OnInit {

    private getBillingProductsUseCase = inject(GetBillingProductsUseCase);
    private deleteBillingProductUseCase = inject(DeleteBillingProductUseCase);
    private getBillingServicesUseCase = inject(GetBillingServicesUseCase);
    private deleteBillingServiceUseCase = inject(DeleteBillingServiceUseCase);
    private getBillingTaxesUseCase = inject(GetBillingTaxesUseCase);
    private deleteBillingTaxUseCase = inject(DeleteBillingTaxUseCase);
    private getBillingPaymentMethodsUseCase = inject(GetBillingPaymentMethodsUseCase);
    private deleteBillingPaymentMethodUseCase = inject(DeleteBillingPaymentMethodUseCase);
    private getBillingClientsUseCase = inject(GetBillingClientsUseCase);
    private createBillingClientUseCase = inject(CreateBillingClientUseCase);
    private updateBillingClientUseCase = inject(UpdateBillingClientUseCase);
    private deleteBillingClientUseCase = inject(DeleteBillingClientUseCase);

    private getPreferencesUseCase = inject(GetBillingTemplatePreferencesUseCase);
    private updatePreferencesUseCase = inject(UpdateBillingTemplatePreferencesUseCase);
    private fb = inject(FormBuilder);

    private toast = inject(ToastService);
    public dialog = inject(MatDialog);

    // Clients
    public clients = signal<BillingClient[]>([]);
    public isClientsLoading = signal(false);
    private isClientsLoaded = false;

    // Payment Methods
    public paymentMethods = signal<BillingPaymentMethod[]>([]);
    public isPaymentMethodsLoading = signal(false);
    private isPaymentMethodsLoaded = false;

    // Taxes
    public taxes = signal<BillingTax[]>([]);
    public isTaxesLoading = signal(false);
    private isTaxesLoaded = false;

    // Services
    public services = signal<BillingService[]>([]);
    public isServicesLoading = signal(false);
    private isServicesLoaded = false;

    public products = signal<BillingProduct[]>([]);
    public isProductsLoading = signal(false);
    private isProductsLoaded = false;

    // Columns
    public clientColumns = ['document', 'name', 'email', 'phone', 'status', 'actions'];
    public paymentColumns = ['name', 'details', 'status', 'actions'];
    public taxColumns = ['name', 'rate', 'actions'];
    public serviceColumns = ['name', 'codes', 'price', 'actions'];
    public productColumns = ['name', 'codes', 'price', 'inventoryLink', 'actions'];

    // Preferences
    public templateForm: FormGroup;
    public isPreferencesLoading = signal(false);
    public isPreferencesSaving = signal(false);
    private isPreferencesLoaded = false;

    constructor() {
        this.templateForm = this.fb.group({
            primaryColor: ['#2dd4bf', Validators.required],
            secondaryColor: ['#14b8a6', Validators.required],
            logoUrl: [null]
        });
    }

    ngOnInit() {
        this.loadClients();
        this.isClientsLoaded = true;
    }

    onTabChange(event: MatTabChangeEvent) {
        // Tab index 0 is "Clientes"
        if (event.index === 0 && !this.isClientsLoaded) {
            this.loadClients();
            this.isClientsLoaded = true;
        }
        // Tab index 1 is "Medios de Pago"
        if (event.index === 1 && !this.isPaymentMethodsLoaded) {
            this.loadPaymentMethods();
            this.isPaymentMethodsLoaded = true;
        }
        // Tab index 2 is "Impuestos"
        if (event.index === 2 && !this.isTaxesLoaded) {
            this.loadTaxes();
            this.isTaxesLoaded = true;
        }
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
        // Tab index 5 is "Plantilla de Factura"
        if (event.index === 5 && !this.isPreferencesLoaded) {
            this.loadPreferences();
            this.isPreferencesLoaded = true;
        }
    }

    private loadPreferences() {
        this.isPreferencesLoading.set(true);
        this.getPreferencesUseCase.execute().subscribe({
            next: (data) => {
                if (data) {
                    this.templateForm.patchValue(data);
                }
                this.isPreferencesLoading.set(false);
            },
            error: (err) => {
                this.toast.error('Error al cargar preferencias de plantilla');
                console.error(err);
                this.isPreferencesLoading.set(false);
            }
        });
    }

    public savePreferences() {
        if (this.templateForm.invalid) return;

        this.isPreferencesSaving.set(true);
        this.updatePreferencesUseCase.execute(this.templateForm.value).subscribe({
            next: (data) => {
                this.toast.success('Preferencias de plantilla guardadas');
                this.templateForm.patchValue(data);
                this.isPreferencesSaving.set(false);
            },
            error: (err) => {
                this.toast.error('Error al guardar las preferencias');
                console.error(err);
                this.isPreferencesSaving.set(false);
            }
        });
    }

    private loadClients() {
        this.isClientsLoading.set(true);
        this.getBillingClientsUseCase.execute().subscribe({
            next: (data) => {
                this.clients.set(data);
                this.isClientsLoading.set(false);
            },
            error: (err) => {
                this.toast.error('Error al cargar clientes');
                console.error(err);
                this.isClientsLoading.set(false);
            }
        });
    }

    private loadPaymentMethods() {
        this.isPaymentMethodsLoading.set(true);
        this.getBillingPaymentMethodsUseCase.execute().subscribe({
            next: (data) => {
                this.paymentMethods.set(data);
                this.isPaymentMethodsLoading.set(false);
            },
            error: (err) => {
                this.toast.error('Error al cargar medios de pago');
                console.error(err);
                this.isPaymentMethodsLoading.set(false);
            }
        });
    }

    private loadTaxes() {
        this.isTaxesLoading.set(true);
        this.getBillingTaxesUseCase.execute().subscribe({
            next: (data) => {
                this.taxes.set(data);
                this.isTaxesLoading.set(false);
            },
            error: (err) => {
                this.toast.error('Error al cargar configuración fiscal');
                console.error(err);
                this.isTaxesLoading.set(false);
            }
        });
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

    // Placeholder actions for static tabs
    linkInventory(item: BillingProduct) { console.log('Link to inventory', item); }

    // Real Action for Clients
    openClientForm(client?: BillingClient) {
        const dialogRef = this.dialog.open(BillingClientFormComponent, {
            width: '600px',
            data: { client },
        });

        dialogRef.afterClosed().subscribe(async (result) => {
            if (result) {
                try {
                    if (client && client.id) {
                        await lastValueFrom(this.updateBillingClientUseCase.execute(client.id, result));
                        this.toast.success('Cliente actualizado correctamente');
                    } else {
                        await lastValueFrom(this.createBillingClientUseCase.execute(result));
                        this.toast.success('Cliente creado correctamente');
                    }
                    this.loadClients();
                } catch (error) {
                    this.toast.error('Error al guardar el cliente');
                    console.error(error);
                }
            }
        });
    }

    async deleteClient(client: BillingClient) {
        if (confirm(`¿Estás seguro de eliminar el cliente "${client.name}"?`)) {
            try {
                await lastValueFrom(this.deleteBillingClientUseCase.execute(client.id));
                this.toast.success('Cliente eliminado correctamente');
                this.loadClients();
            } catch (err: any) {
                this.toast.error('Error al eliminar el cliente');
            }
        }
    }

    // Real Action for Payment Methods
    openPaymentMethodForm(paymentMethod?: BillingPaymentMethod) {
        const dialogRef = this.dialog.open(BillingPaymentMethodFormComponent, {
            width: '500px',
            data: paymentMethod,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadPaymentMethods();
            }
        });
    }

    async deletePaymentMethod(paymentMethod: BillingPaymentMethod) {
        if (confirm(`¿Estás seguro de eliminar el medio de pago "${paymentMethod.name}"?`)) {
            try {
                await lastValueFrom(this.deleteBillingPaymentMethodUseCase.execute(paymentMethod.id));
                this.toast.success('Medio de pago eliminado correctamente');
                this.loadPaymentMethods();
            } catch (err: any) {
                this.toast.error('Error al eliminar el medio de pago');
            }
        }
    }

    // Real Action for Taxes
    openTaxForm(tax?: BillingTax) {
        const dialogRef = this.dialog.open(BillingTaxFormComponent, {
            width: '400px',
            data: tax,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadTaxes();
            }
        });
    }

    async deleteTax(tax: BillingTax) {
        if (confirm(`¿Estás seguro de eliminar el impuesto "${tax.name}"?`)) {
            try {
                await lastValueFrom(this.deleteBillingTaxUseCase.execute(tax.id));
                this.toast.success('Impuesto eliminado correctamente');
                this.loadTaxes();
            } catch (err: any) {
                this.toast.error('Error al eliminar el impuesto');
            }
        }
    }

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
