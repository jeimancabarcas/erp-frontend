export interface BillingTemplatePreference {
    id?: string;
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string | null;
    nit?: string | null;
    companyName?: string | null;
    address?: string | null;
    phone1?: string | null;
    phone2?: string | null;
    email?: string | null;
    website?: string | null;
    createdAt?: string;
    updatedAt?: string;
}
