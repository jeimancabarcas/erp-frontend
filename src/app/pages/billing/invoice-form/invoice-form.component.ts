import { Component, OnInit, inject, computed, signal, effect } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
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
import { GetBillingTaxesUseCase } from '../../../core/application/use-cases/get-billing-taxes.use-case';
import { BillingTemplatePreference } from '../../../core/domain/entities/billing-template-preference.entity';
import { BillingTax } from '../../../core/domain/entities/billing-tax.entity';
import { GetBillingClientsUseCase } from '../../../core/application/use-cases/billing-client/get-billing-clients.use-case';
import { GetBillingProductsUseCase } from '../../../core/application/use-cases/get-billing-products.use-case';
import { GetBillingServicesUseCase } from '../../../core/application/use-cases/get-billing-services.use-case';
import { GetBillingPaymentMethodsUseCase } from '../../../core/application/use-cases/get-billing-payment-methods.use-case';
import { BillingClient } from '../../../core/domain/entities/billing-client.entity';
import { BillingProduct } from '../../../core/domain/entities/billing-product.entity';
import { BillingService } from '../../../core/domain/entities/billing-service.entity';
import { BillingPaymentMethod } from '../../../core/domain/entities/billing-payment-method.entity';
import { BillingPaymentFrequency } from '../../../core/domain/entities/billing-payment-frequency.entity';
import { BillingPaymentTerm } from '../../../core/domain/entities/billing-payment-term.entity';
import { GetBillingPaymentFrequenciesUseCase } from '../../../core/application/use-cases/get-billing-payment-frequencies.use-case';
import { GetBillingPaymentTermsUseCase } from '../../../core/application/use-cases/get-billing-payment-terms.use-case';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ClientSelectionModalComponent } from './client-selection-modal.component';
import { ItemSelectionModalComponent } from './item-selection-modal.component';
import { BillingPaymentMethodFormComponent } from '../settings/billing-payment-method-form/billing-payment-method-form.component';
import { TaxSelectionModalComponent } from './tax-selection-modal.component';
import { PaymentMethodSelectionModalComponent } from './payment-method-selection-modal.component';
import { AuthService } from '../../../core/services/auth.service';
import { CreateBillingInvoiceUseCase } from '../../../core/application/use-cases/billing-invoice/create-billing-invoice.use-case';
import { GetNextInvoiceNumberUseCase } from '../../../core/application/use-cases/billing-invoice/get-next-invoice-number.use-case';
import { GetBillingInvoiceByIdUseCase } from '../../../core/application/use-cases/billing-invoice/get-billing-invoice-by-id.use-case';
import { UpdateBillingInvoiceStatusUseCase } from '../../../core/application/use-cases/billing-invoice/update-billing-invoice-status.use-case';
import { BillingInvoice, BillingInvoiceItem, BillingInvoiceItemTax } from '../../../core/domain/entities/billing-invoice.entity';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-invoice-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
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

        /* Print Formats CSS */
        @media print {
            .print-A4 {
                width: 210mm;
                min-height: 297mm;
                padding: 10mm;
                margin: 0 auto;
            }
            .print-POS {
                width: 80mm;
                padding: 2mm;
                margin: 0;
                font-size: 10px !important;
            }
            .print-POS * {
                font-size: 10px !important;
            }
            .print-POS .hide-on-pos {
                display: none !important;
            }
            .print-POS table {
                width: 100% !important;
            }
            .print-POS .mat-card {
                padding: 0 !important;
                box-shadow: none !important;
            }
            .print-POS .pos-divider {
                border-top: 1px dashed #000;
                margin: 5px 0;
            }
            .print-POS .A4-only {
                display: none !important;
            }
        }

        /* Screen POS Preview */
        .pos-card {
            max-width: 380px !important;
            margin: 0 auto !important;
            font-size: 11px !important;
        }
        .pos-card .px-8 {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
        }
        .pos-card .mb-12 {
            margin-bottom: 1.5rem !important;
        }
        .pos-card .invoice-input {
            font-size: 11px !important;
            padding: 2px !important;
        }
        .pos-card .text-4xl {
            font-size: 1.5rem !important;
        }
        .pos-card .text-lg {
            font-size: 1rem !important;
        }
    `]
})
export class InvoiceFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private getInvoiceByIdUseCase = inject(GetBillingInvoiceByIdUseCase);
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
    private getTaxesUseCase = inject(GetBillingTaxesUseCase);
    private getFrequenciesUseCase = inject(GetBillingPaymentFrequenciesUseCase);
    private getTermsUseCase = inject(GetBillingPaymentTermsUseCase);
    private authService = inject(AuthService);
    private createInvoiceUseCase = inject(CreateBillingInvoiceUseCase);
    private getNextInvoiceNumberUseCase = inject(GetNextInvoiceNumberUseCase);
    private updateStatusUseCase = inject(UpdateBillingInvoiceStatusUseCase);
    private toastr = inject(ToastrService);

    allTaxes = signal<BillingTax[]>([]);
    clients = signal<BillingClient[]>([]);
    products = signal<BillingProduct[]>([]);
    services = signal<BillingService[]>([]);
    paymentMethods = signal<BillingPaymentMethod[]>([]);
    paymentFrequencies = signal<BillingPaymentFrequency[]>([]);
    paymentTerms = signal<BillingPaymentTerm[]>([]);
    printFormat = signal<'A4' | 'POS'>('A4');
    isReadOnly = signal(false);
    invoiceId = signal<string | null>(null);
    currentStatus = signal<string>('Emitida');

    signatureFonts = [
        { name: 'Brush Script', value: "'Brush Script MT', cursive" },
        { name: 'Dancing Script', value: "'Dancing Script', cursive" },
        { name: 'Alex Brush', value: "'Alex Brush', cursive" },
        { name: 'Great Vibes', value: "'Great Vibes', cursive" },
        { name: 'Sacramento', value: "'Sacramento', cursive" },
        { name: 'Saint Delafield', value: "'Mrs Saint Delafield', cursive" },
    ];

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

    availableTerms = computed(() => {
        const freqId = this.invoiceForm.get('creditFrequencyId')?.value;
        const freq = this.paymentFrequencies().find(f => f.id === freqId);
        if (!freq) return this.paymentTerms();
        return this.paymentTerms().filter(t => t.days >= freq.days);
    });

    constructor() {
        this.invoiceForm = this.fb.group({
            invoiceNumber: ['AUTO'],
            invoiceDate: [new Date()],
            clientId: [null],

            clientName: [''],
            clientPosition: [''],
            clientAddress: [''],
            clientPhone: [''],
            clientEmail: [''],

            companyName: [''],

            items: this.fb.array([]),

            paymentMethodId: [''],
            paymentType: ['Debito'],
            creditInstallments: [1],
            creditFrequencyId: [''],
            creditTermId: [''],
            creditPeriodicity: [''], // kept for backward compatibility if needed, or can be removed
            creditTerm: [''],        // kept for backward compatibility or display
            discountType: ['percent'],
            discountRate: [0],
            signatureFont: ["'Sacramento', cursive"],
            signatureName: [this.authService.currentUser()?.profile?.fullName || this.authService.currentUser()?.profile?.displayName || ''],
            signaturePosition: [this.authService.currentUser()?.profile?.position || ''],
            signatureIdType: [this.authService.currentUser()?.profile?.identificationType || ''],
            signatureIdNumber: [this.authService.currentUser()?.profile?.identificationNumber || ''],

            notes: ['Gracias por su compra. Esta factura debe ser pagada dentro de los 30 días posteriores a su emisión.'],
            paymentMethodName: [''],
            paymentMethodDetails: [''],
            creditFrequencyName: [''],
            creditTermName: ['']
        });

        // Initialize with one empty item removed from here to avoid duplication with ngOnInit

        // Reactive effect to pre-populate signature with user profile data
        effect(() => {
            const user = this.authService.currentUser();
            if (user?.profile) {
                this.invoiceForm.patchValue({
                    signatureName: user.profile.fullName || user.profile.displayName || '',
                    signaturePosition: user.profile.position || '',
                    signatureIdType: user.profile.identificationType || '',
                    signatureIdNumber: user.profile.identificationNumber || '',
                }, { emitEvent: false });
            }
        });

        // Listen for changes
        this.invoiceForm.valueChanges.subscribe(() => {
            this.calculateTotals();
            this.updateCreditLogic();
        });

    }

    private updateCreditLogic() {
        if (!this.invoiceForm) return;

        const freqId = this.invoiceForm.get('creditFrequencyId')?.value;
        const termId = this.invoiceForm.get('creditTermId')?.value;
        const type = this.invoiceForm.get('paymentType')?.value;

        if (type === 'Credito') {
            const freq = this.paymentFrequencies().find(f => f.id === freqId);
            const term = this.paymentTerms().find(t => t.id === termId);

            if (freq && term) {
                let installments = 1;
                if (term.days >= freq.days && freq.days > 0) {
                    installments = Math.max(1, Math.floor(term.days / freq.days));
                }

                this.invoiceForm.get('creditInstallments')?.setValue(installments, { emitEvent: false });

                // Update terms and conditions text
                const notesText = `Esta factura de crédito a ${term.name} será cancelada en ${installments} ${installments === 1 ? 'cuota' : 'cuotas'} con frecuencia ${freq.name}.`;
                this.invoiceForm.get('notes')?.setValue(notesText, { emitEvent: false });

                // Sync text fields for display if needed
                this.invoiceForm.patchValue({
                    creditPeriodicity: freq.name,
                    creditTerm: term.name
                }, { emitEvent: false });
            } else {
                if (!freqId || !termId) {
                    this.invoiceForm.get('notes')?.setValue('Esta factura debe ser pagada según las condiciones de crédito acordadas.', { emitEvent: false });
                }
            }
        } else {
            // Default notes for Debit/Cash
            this.invoiceForm.get('notes')?.setValue('Gracias por su compra. Esta factura de contado debe ser pagada al momento de su emisión.', { emitEvent: false });
        }
    }

    ngOnInit(): void {
        this.loadInitialData();
        this.loadBillingData(); // Load billing data for both new and existing invoices

        // Check if we are in view mode
        const snapshot = this.route.snapshot;
        if (snapshot.data['isReadOnly']) {
            this.isReadOnly.set(true);
        }

        const id = snapshot.params['id'];
        if (id) {
            this.invoiceId.set(id);
            this.loadInvoice(id);
        } else {
            // Only if creating new
            this.addItem();
            this.fetchNextInvoiceNumber();
        }
    }

    private fetchNextInvoiceNumber() {
        this.getNextInvoiceNumberUseCase.execute().subscribe({
            next: (response: { nextNumber: string }) => {
                this.invoiceForm.patchValue({
                    invoiceNumber: response.nextNumber
                }, { emitEvent: false });
            },
            error: (err: any) => {
                console.error('Error fetching next invoice number:', err);
                // Fallback to AUTO if we can't fetch the predictor
                this.invoiceForm.patchValue({
                    invoiceNumber: 'AUTO'
                }, { emitEvent: false });
            }
        });
    }

    onUpdateStatus(newStatus: string) {
        const id = this.invoiceId();
        if (!id) return;

        this.updateStatusUseCase.execute(id, newStatus).subscribe({
            next: () => {
                this.currentStatus.set(newStatus);
                this.toastr.success(`Estado actualizado a: ${newStatus}`, 'Éxito');
            },
            error: (err) => {
                this.toastr.error('Error al actualizar el estado', 'Error');
                console.error(err);
            }
        });
    }

    private loadInitialData() {
        this.calculateTotals();
        this.loadPreferences();
    }

    private loadInvoice(id: string) {
        this.getInvoiceByIdUseCase.execute(id).subscribe({
            next: (invoice) => {
                this.populateFormWithInvoice(invoice);
                this.currentStatus.set(invoice.status || 'Emitida');
                if (this.isReadOnly()) {
                    this.invoiceForm.disable();
                }
            },
            error: (err) => {
                this.toastr.error('No se pudo cargar la factura');
                this.router.navigate(['/billing/sales']);
            }
        });
    }

    private populateFormWithInvoice(invoice: BillingInvoice) {
        // Prepare items array
        this.items.clear();
        invoice.items.forEach(item => {
            const itemGroup = this.createItem();

            // Map snapshot taxes back to selection format if possible, 
            // but for view-only we just care about the display list
            const taxes = item.taxes.map(t => ({
                tax: { name: t.taxName } as any, // Temporary object for display
                rate: t.taxRate
            }));

            itemGroup.patchValue({
                itemId: item.itemId,
                description: item.description,
                price: item.price,
                quantity: item.quantity,
                itemType: item.itemType,
                standardCode: item.standardCode,
                internalCode: item.internalCode,
                taxes: taxes,
                taxSelection: taxes.map(t => t.tax)
            });
            this.items.push(itemGroup);
        });

        this.invoiceForm.patchValue({
            invoiceNumber: invoice.invoiceNumber,
            invoiceDate: new Date(invoice.invoiceDate),
            clientId: invoice.clientId,
            clientName: invoice.clientName,
            clientPosition: `${invoice.clientDocumentType}: ${invoice.clientDocumentNumber}`,
            clientAddress: invoice.clientAddress,
            clientPhone: invoice.clientPhone,
            clientEmail: invoice.clientEmail,
            paymentType: invoice.paymentType,
            // Note: Since it's a snapshot, some master data links might be broken
            // We mainly want to display the saved text values
            creditInstallments: invoice.creditInstallments,
            signatureName: invoice.signatureName,
            signaturePosition: invoice.signaturePosition,
            signatureIdType: invoice.signatureIdType,
            signatureIdNumber: invoice.signatureIdNumber,
            signatureFont: invoice.signatureFont,
            paymentMethodName: invoice.paymentMethodName,
            paymentMethodDetails: invoice.paymentMethodDetails,
            creditFrequencyName: invoice.creditFrequencyName,
            creditTermName: invoice.creditTermName
        }, { emitEvent: false });

        this.calculateTotals();
    }

    private loadBillingData() {
        this.getClientsUseCase.execute().subscribe(data => this.clients.set(data));
        this.getProductsUseCase.execute().subscribe(data => this.products.set(data));
        this.getServicesUseCase.execute().subscribe(data => this.services.set(data));
        this.getPaymentMethodsUseCase.execute().subscribe(data => this.paymentMethods.set(data));
        this.getTaxesUseCase.execute().subscribe(data => this.allTaxes.set(data));
        this.getFrequenciesUseCase.execute().subscribe(data => {
            this.paymentFrequencies.set(data);
            this.updateCreditLogic();
        });
        this.getTermsUseCase.execute().subscribe(data => {
            this.paymentTerms.set(data);
            this.updateCreditLogic();
        });
    }

    private loadPreferences() {
        this.getPreferencesUseCase.execute().subscribe({
            next: (pref: BillingTemplatePreference) => {
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
                const docInfo = `${client.documentType}: ${client.documentNumber}`;

                this.invoiceForm.patchValue({
                    clientId: client.id,
                    clientName: client.name,
                    clientPosition: docInfo,
                    clientAddress: client.address || '',
                    clientPhone: client.phone || '',
                    clientEmail: client.email || '',
                    companyName: '' // Clear the old consolidated field
                });
            }
        });
    }

    onSelectPaymentMethod() {
        const dialogRef = this.dialog.open(PaymentMethodSelectionModalComponent, {
            width: '600px',
            data: { methods: this.paymentMethods() }
        });

        dialogRef.afterClosed().subscribe(pm => {
            if (pm) {
                this.invoiceForm.get('paymentMethodId')?.setValue(pm.id);
            }
        });
    }

    onSelectTax(index: number) {
        const dialogRef = this.dialog.open(TaxSelectionModalComponent, {
            width: '600px',
            data: { taxes: this.allTaxes() }
        });

        dialogRef.afterClosed().subscribe(tax => {
            if (tax) {
                this.addTaxToItem(index, tax);
            }
        });
    }

    private addTaxToItem(index: number, tax: BillingTax) {
        const itemForm = this.items.at(index);
        const currentTaxesArray = [...(itemForm.get('taxes')?.value || [])];

        const alreadyExists = currentTaxesArray.some((ct: any) => ct.tax.id === tax.id);
        if (!alreadyExists) {
            currentTaxesArray.push({
                tax: tax,
                rate: tax.rate
            });
            itemForm.get('taxes')?.setValue(currentTaxesArray);
            this.calculateTotals();
        }
    }

    onAddPaymentMethod() {
        const dialogRef = this.dialog.open(BillingPaymentMethodFormComponent, {
            width: '500px',
            data: null // Create mode
        });

        dialogRef.afterClosed().subscribe(newPm => {
            if (newPm) {
                // Refresh list
                this.getPaymentMethodsUseCase.execute().subscribe(data => {
                    this.paymentMethods.set(data);
                    // Selection of the new one
                    this.invoiceForm.get('paymentMethodId')?.setValue(newPm.id);
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
                // Map item taxes to { tax: BillingTax, rate: number }
                // item.taxes contains { id, taxId, rate, tax: BillingTax }
                const itemTaxes = (item.taxes || []).map((it: any) => ({
                    tax: it.tax,
                    rate: it.rate
                })).filter((it: any) => it.tax);

                itemForm.patchValue({
                    itemId: item.id,
                    description: item.name,
                    price: item.price,
                    itemType: item.type,
                    standardCode: item.standardCode,
                    internalCode: item.internalCode,
                    taxes: itemTaxes,
                    taxSelection: itemTaxes.map((it: any) => it.tax)
                });
                this.calculateTotals();
            }
        });
    }

    onTaxSelectionChange(index: number, selectedTaxes: BillingTax[]) {
        // This is kept for compatibility if needed, but we'll use addTaxToItem now
    }

    removeTaxFromItem(itemIndex: number, taxId: string) {
        const itemForm = this.items.at(itemIndex);
        const currentTaxesArray = [...(itemForm.get('taxes')?.value || [])];
        const newTaxes = currentTaxesArray.filter(t => t.tax.id !== taxId);
        itemForm.get('taxes')?.setValue(newTaxes);
        this.calculateTotals();
    }

    updateTaxRate(itemIndex: number, taxId: string, event: Event) {
        const input = event.target as HTMLInputElement;
        const newRate = parseFloat(input.value);
        if (isNaN(newRate)) return;

        const itemForm = this.items.at(itemIndex);
        const taxes = [...(itemForm.get('taxes')?.value || [])];
        const taxEntry = taxes.find(t => t.tax.id === taxId);

        if (taxEntry) {
            taxEntry.rate = Math.min(newRate, taxEntry.tax.rate);
            itemForm.get('taxes')?.setValue(taxes, { emitEvent: false }); // Avoid loop if watching taxes
            this.calculateTotals();
        }
    }

    compareTaxes(t1: any, t2: any): boolean {
        return t1 && t2 ? t1.id === t2.id : t1 === t2;
    }

    onDescriptionChange(index: number) {
        this.items.at(index).patchValue({
            itemId: null,
            itemType: null,
            standardCode: null,
            internalCode: null
        });
    }

    createItem(): FormGroup {
        return this.fb.group({
            itemId: [null], // ID of the product/service if selected from search
            itemType: [null],
            standardCode: [null],
            internalCode: [null],
            description: [''],
            price: [0, [Validators.required, Validators.min(0)]],
            quantity: [1, [Validators.required, Validators.min(1)]],
            taxes: [[]], // Array of { tax: BillingTax, rate: number }
            taxSelection: [[]] // Array of BillingTax entities for the select
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

    getItemTaxTotal(index: number): number {
        const item = this.items.at(index).value;
        const itemSubtotal = (item.price || 0) * (item.quantity || 0);
        let totalTax = 0;
        if (item.taxes && Array.isArray(item.taxes)) {
            item.taxes.forEach((t: any) => {
                totalTax += itemSubtotal * ((t.rate || 0) / 100);
            });
        }
        return totalTax;
    }

    calculateTotals(): void {
        let sub = 0;
        let totalTax = 0;
        const itemsValue = this.items.getRawValue();

        itemsValue.forEach(item => {
            const itemSubtotal = (item.price || 0) * (item.quantity || 0);
            sub += itemSubtotal;

            // Calculate taxes for this item using their specific rates
            if (item.taxes && Array.isArray(item.taxes)) {
                item.taxes.forEach((t: any) => {
                    totalTax += itemSubtotal * ((t.rate || 0) / 100);
                });
            }
        });

        this.subTotal.set(sub);
        this.taxAmount.set(totalTax);

        const discountType = this.invoiceForm.get('discountType')?.value || 'percent';
        const discountValue = this.invoiceForm.get('discountRate')?.value || 0;
        let calculatedDiscount = 0;

        if (discountType === 'percent') {
            calculatedDiscount = sub * (discountValue / 100);
        } else {
            calculatedDiscount = discountValue;
        }

        this.discountAmount.set(calculatedDiscount);

        this.grandTotal.set(sub + totalTax - calculatedDiscount);
    }

    onSubmit(): void {
        if (this.invoiceForm.invalid) {
            this.toastr.error('Por favor complete todos los campos requeridos', 'Error');
            this.invoiceForm.markAllAsTouched();
            return;
        }

        const formValue = this.invoiceForm.getRawValue();
        const prefs = this.preferences();
        const user = this.authService.currentUser();

        // Map Items for Snapshot
        const itemsSnapshot: BillingInvoiceItem[] = this.items.controls.map(control => {
            const val = control.value;
            const itemBase = Number(val.price || 0) * Number(val.quantity || 0);
            let itemTaxesTotal = 0;

            const itemTaxes = (val.taxes || []).map((t: any) => {
                const taxAmount = itemBase * (Number(t.rate) / 100);
                itemTaxesTotal += taxAmount;
                return {
                    taxName: t.tax.name,
                    taxRate: Number(t.rate),
                    taxAmount: taxAmount
                };
            });

            return {
                description: val.description,
                price: Number(val.price),
                quantity: Number(val.quantity),
                subTotal: itemBase + itemTaxesTotal,
                itemId: val.itemId || null,
                itemType: val.itemType || null,
                standardCode: val.standardCode || null,
                internalCode: val.internalCode || null,
                taxes: itemTaxes
            };
        });

        const paymentMethod = this.paymentMethods().find(pm => pm.id === formValue.paymentMethodId);
        const frequency = this.paymentFrequencies().find(f => f.id === formValue.creditFrequencyId);
        const term = this.paymentTerms().find(t => t.id === formValue.creditTermId);

        // Build Invoice Snapshot object
        const invoiceSnapshot: BillingInvoice = {
            invoiceNumber: formValue.invoiceNumber,
            invoiceDate: formValue.invoiceDate.toISOString(),
            clientId: formValue.clientId || null,

            // Company Snapshot (Seller)
            companyName: prefs.companyName || 'Empresa Generica',
            companyNit: prefs.nit || '000-000-000',
            companyAddress: prefs.address || '',
            companyPhone: prefs.phone1 || '',
            companyEmail: prefs.email || '',
            companyWebsite: prefs.website || '',
            companyLogoUrl: prefs.logoUrl || '',

            // Client Snapshot (Buyer)
            clientName: formValue.clientName,
            clientDocumentType: formValue.clientPosition?.split(':')[0]?.trim() || 'NIT',
            clientDocumentNumber: formValue.clientPosition?.split(':')[1]?.trim() || '0',
            clientAddress: formValue.clientAddress || '',
            clientPhone: formValue.clientPhone || '',
            clientEmail: formValue.clientEmail || '',

            // Payment Snapshot
            paymentType: formValue.paymentType,
            paymentMethodName: paymentMethod?.name || 'Contado',
            paymentMethodDetails: `Medio: ${paymentMethod?.name || 'Efectivo'}`,

            // Credit Snapshot
            creditInstallments: Number(formValue.creditInstallments || 1),
            creditFrequencyName: frequency?.name || '',
            creditTermName: term?.name || '',

            // Totals
            subTotal: this.subTotal(),
            taxAmount: this.taxAmount(),
            discountAmount: this.discountAmount(),
            grandTotal: this.grandTotal(),

            // Appearance & Terms
            notes: formValue.notes || '',
            signatureName: formValue.signatureName || user?.profile?.fullName || '',
            signaturePosition: formValue.signaturePosition || '',
            signatureIdType: formValue.signatureIdType || '',
            signatureIdNumber: formValue.signatureIdNumber || '',
            signatureFont: formValue.signatureFont || '',

            items: itemsSnapshot
        };

        this.createInvoiceUseCase.execute(invoiceSnapshot).subscribe({
            next: (saved) => {
                this.toastr.success(`Factura ${saved.invoiceNumber} guardada exitosamente`, 'Éxito');
                this.router.navigate(['/billing/sales/view', saved.id]);
            },
            error: (err) => {
                this.toastr.error('Error al guardar la factura: ' + (err.error?.message || err.message), 'Error');
                console.error('Invoice save error:', err);
            }
        });
    }

    getItemType(item: any): string {
        return item.type || '';
    }

    onPrint(): void {
        window.print();
    }

    onCancel(): void {
        this.router.navigate(['/billing/sales']);
    }

    getSelectedPaymentMethod() {
        const id = this.invoiceForm.get('paymentMethodId')?.value;
        const found = this.paymentMethods().find(pm => pm.id === id);
        if (found) return found;

        // Fallback for read-only / snapshot mode
        if (this.isReadOnly()) {
            return {
                name: this.invoiceForm.get('paymentMethodName')?.value || 'Contado',
                description: this.invoiceForm.get('paymentMethodDetails')?.value || ''
            } as any;
        }
        return null;
    }
}
