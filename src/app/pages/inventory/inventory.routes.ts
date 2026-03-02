import { Routes } from '@angular/router';
import { InventoryListComponent } from './inventory-list.component';
import { MovementsComponent } from './movements/movements.component';
import { InventoryDashboardComponent } from './dashboard/inventory-dashboard.component';

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
    {
        path: 'products',
        component: InventoryListComponent,
        data: {
            title: 'Gestión de Productos',
            urls: [
                { title: 'Dashboard', url: '/dashboards/dashboard1' },
                { title: 'Inventario', url: '/inventory' },
                { title: 'Gestión de Productos' },
            ],
        },
    },
    {
        path: 'movements',
        component: MovementsComponent,
        data: {
            title: 'Movimientos',
            urls: [
                { title: 'Dashboard', url: '/dashboards/dashboard1' },
                { title: 'Inventario', url: '/inventory' },
                { title: 'Movimientos' },
            ],
        },
    },
    {
        path: 'dashboard',
        component: InventoryDashboardComponent,
        data: {
            title: 'Dashboard de Inventario',
            urls: [
                { title: 'Inventario', url: '/inventory' },
                { title: 'Dashboard' },
            ],
        },
    },
];
