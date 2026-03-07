import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ClientSettingsComponent } from './client-settings/client-settings.component';
import { PaymentMeansSettingsComponent } from './payment-means-settings/payment-means-settings.component';
import { TaxSettingsComponent } from './tax-settings/tax-settings.component';
import { ServiceSettingsComponent } from './service-settings/service-settings.component';
import { ProductSettingsComponent } from './product-settings/product-settings.component';
import { InvoiceTemplateSettingsComponent } from './invoice-template-settings/invoice-template-settings.component';
import { PaymentFrequencySettingsComponent } from './payment-frequency-settings/payment-frequency-settings.component';
import { PaymentTermSettingsComponent } from './payment-term-settings/payment-term-settings.component';

@Component({
    selector: 'app-billing-settings',
    standalone: true,
    imports: [
        CommonModule,
        MatTabsModule,
        TablerIconsModule,
        ClientSettingsComponent,
        PaymentMeansSettingsComponent,
        TaxSettingsComponent,
        ServiceSettingsComponent,
        ProductSettingsComponent,
        InvoiceTemplateSettingsComponent,
        PaymentFrequencySettingsComponent,
        PaymentTermSettingsComponent
    ],
    templateUrl: './billing-settings.component.html',
})
export class BillingSettingsComponent { }
