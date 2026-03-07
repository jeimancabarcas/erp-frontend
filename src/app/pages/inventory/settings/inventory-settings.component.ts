import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { TablerIconsModule } from 'angular-tabler-icons';
import { CategorySettingsComponent } from './categories/category-settings.component';

@Component({
    selector: 'app-inventory-settings',
    standalone: true,
    imports: [
        CommonModule,
        MatTabsModule,
        TablerIconsModule,
        CategorySettingsComponent
    ],
    templateUrl: './inventory-settings.component.html',
})
export class InventorySettingsComponent { }
