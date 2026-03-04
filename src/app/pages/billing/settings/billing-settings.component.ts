import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TablerIconsModule } from 'angular-tabler-icons';
import { TranslateModule } from '@ngx-translate/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

export interface Client { id: string; name: string; email: string; phone: string; status: string; }
export interface PaymentMethod { id: string; name: string; details: string; status: string; }
export interface Tax { id: string; name: string; rate: number; }
export interface Service { id: string; name: string; price: number; }
export interface BillingProduct { id: string; name: string; price: number; linkedToInventory: boolean; inventorySku?: string; }

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
        MatSlideToggleModule
    ],
    templateUrl: './billing-settings.component.html'
})
export class BillingSettingsComponent {

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

    public services = signal<Service[]>([
        { id: '1', name: 'Consultoría Técnica', price: 150000 },
        { id: '2', name: 'Soporte Mensual', price: 500000 },
        { id: '3', name: 'Capacitación', price: 300000 }
    ]);

    public products = signal<BillingProduct[]>([
        { id: '1', name: 'Licencia Software Base', price: 1200000, linkedToInventory: true, inventorySku: 'LIC-001' },
        { id: '2', name: 'Módulo de Analítica', price: 800000, linkedToInventory: false },
        { id: '3', name: 'Hardware TPV', price: 2500000, linkedToInventory: true, inventorySku: 'HW-TPV-05' }
    ]);

    // Columns
    public clientColumns = ['name', 'email', 'phone', 'status', 'actions'];
    public paymentColumns = ['name', 'details', 'status', 'actions'];
    public taxColumns = ['name', 'rate', 'actions'];
    public serviceColumns = ['name', 'price', 'actions'];
    public productColumns = ['name', 'price', 'inventoryLink', 'actions'];

    // Placeholder actions
    edit(item: any) { console.log('Edit', item); }
    delete(item: any) { console.log('Delete', item); }
    linkInventory(item: BillingProduct) { console.log('Link to inventory', item); }
}
