import { Routes } from '@angular/router';

export const BillingRoutes: Routes = [
    {
        path: 'sales',
        loadComponent: () =>
            import('./sales/sales.component').then(
                (m) => m.SalesComponent
            ),
        data: {
            title: 'Ventas',
            urls: [
                { title: 'Facturación' },
                { title: 'Ventas' },
            ],
        },
    },
    {
        path: 'settings',
        loadComponent: () =>
            import('./settings/billing-settings.component').then(
                (m) => m.BillingSettingsComponent
            ),
        data: {
            title: 'Configuración de Facturación',
            urls: [
                { title: 'Facturación' },
                { title: 'Configuración' },
            ],
        },
    },
];
