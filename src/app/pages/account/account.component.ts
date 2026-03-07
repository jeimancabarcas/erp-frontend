import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ProfileSettingComponent } from './profile/profile.component';
import { CompanySettingComponent } from './company/company.component';
import { SecuritySettingComponent } from './security/security.component';

@Component({
    selector: 'app-account-settings',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatTabsModule,
        TablerIconsModule,
        ProfileSettingComponent,
        CompanySettingComponent,
        SecuritySettingComponent
    ],
    templateUrl: './account.component.html',
})
export class AccountComponent { }
