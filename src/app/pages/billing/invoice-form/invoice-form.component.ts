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
        MatNativeDateModule
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
    `]
})
export class InvoiceFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);

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

    constructor() {
        this.invoiceForm = this.fb.group({
            invoiceNumber: ['0000123'],
            invoiceDate: [new Date()],

            clientName: ['Nombre del Cliente'],
            clientPosition: ['Cargo del Cliente'],

            companyName: ['Calle 123, Ciudad, País 0000'],

            items: this.fb.array([]),

            taxRate: [15],
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

    createItem(): FormGroup {
        return this.fb.group({
            description: [''],
            price: [0, [Validators.required, Validators.min(0)]],
            quantity: [1, [Validators.required, Validators.min(1)]]
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
        const itemsValue = this.items.getRawValue();

        itemsValue.forEach(item => {
            sub += (item.price || 0) * (item.quantity || 0);
        });

        this.subTotal.set(sub);

        const taxRate = this.invoiceForm.get('taxRate')?.value || 0;
        const discountRate = this.invoiceForm.get('discountRate')?.value || 0;

        const calculatedTax = sub * (taxRate / 100);
        this.taxAmount.set(calculatedTax);

        const calculatedDiscount = sub * (discountRate / 100);
        this.discountAmount.set(calculatedDiscount);

        this.grandTotal.set(sub + calculatedTax - calculatedDiscount);
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

    onCancel(): void {
        this.router.navigate(['/billing/sales']);
    }

    onPrint(): void {
        window.print();
    }
}
