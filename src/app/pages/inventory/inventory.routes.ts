import { Routes } from '@angular/router';
import { InventoryListComponent } from './inventory-list.component';

export const InventoryRoutes: Routes = [
    {
        path: '',
        component: InventoryListComponent,
        data: {
            title: 'Inventario',
            urls: [
                { title: 'Dashboard', url: '/dashboards/dashboard1' },
                { title: 'Inventario' },
            ],
        },
    },
];
