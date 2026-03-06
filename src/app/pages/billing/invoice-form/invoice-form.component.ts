import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { GetBillingTemplatePreferencesUseCase } from '../../../core/application/use-cases/billing-template-preferences/get-billing-template-preferences.use-case';
import { BillingTemplatePreference } from '../../../core/domain/entities/billing-template-preference.entity';
import { GetBillingClientsUseCase } from '../../../core/application/use-cases/billing-client/get-billing-clients.use-case';
import { GetBillingProductsUseCase } from '../../../core/application/use-cases/get-billing-products.use-case';
import { GetBillingServicesUseCase } from '../../../core/application/use-cases/get-billing-services.use-case';
import { GetBillingPaymentMethodsUseCase } from '../../../core/application/use-cases/get-billing-payment-methods.use-case';
import { BillingClient } from '../../../core/domain/entities/billing-client.entity';
import { BillingProduct } from '../../../core/domain/entities/billing-product.entity';
import { BillingService } from '../../../core/domain/entities/billing-service.entity';
import { BillingPaymentMethod } from '../../../core/domain/entities/billing-payment-method.entity';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ClientSelectionModalComponent } from './client-selection-modal.component';
import { ItemSelectionModalComponent } from './item-selection-modal.component';

@Component({
    selector: 'app-invoice-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatCardModule,
        MatDividerModule,
        TablerIconsModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        MatAutocompleteModule,
        MatMenuModule,
        MatDialogModule
    ],
    templateUrl: './invoice-form.component.html',
    styles: [`
        .invoice-input {
            width: 100%;
            background: transparent;
            border: 1px solid transparent;
            outline: none;
            padding: 4px;
            transition: border-color 0.2s;
            border-radius: 4px;
        }
        .invoice-input:hover, .invoice-input:focus {
            border-color: #e2e8f0;
            background: #f8fafc;
        }
        .invoice-input.text-right {
            text-align: right;
        }
        ::ng-deep .no-label-field .mat-mdc-form-field-subscript-wrapper {
            display: none;
        }
        ::ng-deep .no-label-field .mat-mdc-text-field-wrapper {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
            height: 40px !important;
        }
        @media print {
            @page {
                margin: 0;
                size: auto;
            }
            body {
                margin: 0;
                -webkit-print-color-adjust: exact;
            }
            .print-area {
                padding: 0 !important;
                margin: 0 !important;
                max-width: none !important;
            }
            mat-card {
                box-shadow: none !important;
                border: none !important;
                margin: 0 !important;
                border-radius: 0 !important;
            }
            /* Prevent extra blank page */
            html, body {
                height: auto !important;
                overflow: visible !important;
            }
        }
        ::ng-deep .invoice-datepicker-toggle .mat-mdc-icon-button {
            color: inherit !important;
        }
    `]
})
export class InvoiceFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private dialog = inject(MatDialog);

    invoiceForm: FormGroup;

    // Reactive signals for totals
    subTotal = signal<number>(0);
    taxAmount = signal<number>(0);
    discountAmount = signal<number>(0);
    grandTotal = signal<number>(0);

    // Preferences
    private getPreferencesUseCase = inject(GetBillingTemplatePreferencesUseCase);
    preferences = signal<BillingTemplatePreference>({
        primaryColor: '#2dd4bf',
        secondaryColor: '#14b8a6',
        logoUrl: null
    });

    // Billing Entities Data
    private getClientsUseCase = inject(GetBillingClientsUseCase);
    private getProductsUseCase = inject(GetBillingProductsUseCase);
    private getServicesUseCase = inject(GetBillingServicesUseCase);
    private getPaymentMethodsUseCase = inject(GetBillingPaymentMethodsUseCase);

    clients = signal<BillingClient[]>([]);
    products = signal<BillingProduct[]>([]);
    services = signal<BillingService[]>([]);
    paymentMethods = signal<BillingPaymentMethod[]>([]);

    // Combined list of items (Products + Services)
    availableItems = computed(() => {
        const p = this.products().map(x => ({
            ...x,
            name: x.name || (x as any).inventoryProduct?.name || 'Producto sin nombre',
            type: 'Producto'
        }));
        const s = this.services().map(x => ({ ...x, type: 'Servicio' }));
        return [...p, ...s];
    });

    constructor() {
        this.invoiceForm = this.fb.group({
            invoiceNumber: ['0000123'],
            invoiceDate: [new Date()],

            clientName: [''],
            clientPosition: [''],

            companyName: [''],

            items: this.fb.array([]),

            discountRate: [5],

            notes: ['Gracias por su compra. Esta factura debe ser pagada dentro de los 30 días posteriores a su emisión.']
        });

        // Initialize with one empty item
        this.addItem();

        // Listen for changes
        this.invoiceForm.valueChanges.subscribe(() => {
            this.calculateTotals();
        });
    }

    ngOnInit(): void {
        this.calculateTotals();
        this.loadPreferences();
        this.loadBillingData();
    }

    private loadBillingData() {
        this.getClientsUseCase.execute().subscribe(data => this.clients.set(data));
        this.getProductsUseCase.execute().subscribe(data => this.products.set(data));
        this.getServicesUseCase.execute().subscribe(data => this.services.set(data));
        this.getPaymentMethodsUseCase.execute().subscribe(data => this.paymentMethods.set(data));
    }

    private loadPreferences() {
        this.getPreferencesUseCase.execute().subscribe({
            next: (pref) => {
                if (pref) {
                    this.preferences.set(pref);
                }
            },
            error: (err) => console.error('Error loading preferences', err)
        });
    }

    get items() {
        return this.invoiceForm.get('items') as FormArray;
    }

    onClientSelect() {
        const dialogRef = this.dialog.open(ClientSelectionModalComponent, {
            width: '600px',
            data: { clients: this.clients() }
        });

        dialogRef.afterClosed().subscribe(client => {
            if (client) {
                this.invoiceForm.patchValue({
                    clientName: client.name,
                    clientPosition: client.email || 'Cliente',
                    companyName: client.phone ? `Tel: ${client.phone}` : ''
                });
            }
        });
    }

    onItemSelect(index: number) {
        const dialogRef = this.dialog.open(ItemSelectionModalComponent, {
            width: '700px',
            data: { items: this.availableItems() }
        });

        dialogRef.afterClosed().subscribe(item => {
            if (item) {
                const itemForm = this.items.at(index);
                itemForm.patchValue({
                    description: item.name,
                    price: item.price || 0,
                    taxes: item.taxes || []
                });
                this.calculateTotals();
            }
        });
    }

    createItem(): FormGroup {
        return this.fb.group({
            description: [''],
            price: [0, [Validators.required, Validators.min(0)]],
            quantity: [1, [Validators.required, Validators.min(1)]],
            taxes: [[]] // Array of { taxId: string, rate: number, tax?: any }
        });
    }

    addItem(): void {
        this.items.push(this.createItem());
        this.calculateTotals();
    }

    removeItem(index: number): void {
        this.items.removeAt(index);
        this.calculateTotals();
    }

    getItemTotal(index: number): number {
        const item = this.items.at(index).value;
        return (item.price || 0) * (item.quantity || 0);
    }

    calculateTotals(): void {
        let sub = 0;
        let totalTax = 0;
        const itemsValue = this.items.getRawValue();

        itemsValue.forEach(item => {
            const itemSubtotal = (item.price || 0) * (item.quantity || 0);
            sub += itemSubtotal;

            // Calculate taxes for this item
            if (item.taxes && Array.isArray(item.taxes)) {
                item.taxes.forEach((t: any) => {
                    totalTax += itemSubtotal * (t.rate / 100);
                });
            }
        });

        this.subTotal.set(sub);
        this.taxAmount.set(totalTax);

        const discountRate = this.invoiceForm.get('discountRate')?.value || 0;
        const calculatedDiscount = sub * (discountRate / 100);
        this.discountAmount.set(calculatedDiscount);

        this.grandTotal.set(sub + totalTax - calculatedDiscount);
    }

    onSubmit(): void {
        if (this.invoiceForm.valid) {
            console.log('Invoice Data:', this.invoiceForm.getRawValue());
            console.log('Totals:', {
                subTotal: this.subTotal(),
                taxAmount: this.taxAmount(),
                discountAmount: this.discountAmount(),
                grandTotal: this.grandTotal()
            });
            // Handle save logic
        }
    }

    getItemType(item: any): string {
        return item.type || '';
    }

    onCancel(): void {
        this.router.navigate(['/billing/sales']);
    }

    onPrint(): void {
        window.print();
    }
}
