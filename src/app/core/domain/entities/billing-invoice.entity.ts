export interface BillingInvoice {
    id?: string;
    invoiceNumber: string;
    invoiceDate: string;
    status?: string;
    clientId?: string | null;

    // Company Snapshot (Seller)
    companyName: string;
    companyNit: string;
    companyAddress: string;
    companyPhone: string;
    companyEmail: string;
    companyWebsite: string;
    companyLogoUrl: string;

    // Client Snapshot (Buyer)
    clientName: string;
    clientDocumentType: string;
    clientDocumentNumber: string;
    clientAddress: string;
    clientPhone: string;
    clientEmail: string;

    // Payment Snapshot
    paymentType: string;
    paymentMethodName: string;
    paymentMethodDetails: string;

    // Credit Snapshot
    creditInstallments: number;
    creditFrequencyName: string;
    creditTermName: string;

    // Totals
    subTotal: number;
    taxAmount: number;
    discountAmount: number;
    grandTotal: number;

    // Appearance & Terms
    notes: string;
    signatureName: string;
    signaturePosition: string;
    signatureIdType: string;
    signatureIdNumber: string;
    signatureFont: string;

    items: BillingInvoiceItem[];
    createdAt?: string;
    updatedAt?: string;
}

export interface BillingInvoiceItem {
    id?: string;
    description: string;
    price: number;
    quantity: number;
    subTotal: number;
    itemId?: string | null;
    itemType?: string | null;
    standardCode?: string | null;
    internalCode?: string | null;
    taxes: BillingInvoiceItemTax[];
}

export interface BillingInvoiceItemTax {
    id?: string;
    taxName: string;
    taxRate: number;
    taxAmount: number;
}
