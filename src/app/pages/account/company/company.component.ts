import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TablerIconsModule } from 'angular-tabler-icons';
import { BillingTemplatePreference } from 'src/app/core/domain/entities/billing-template-preference.entity';
import { GetBillingTemplatePreferencesUseCase } from 'src/app/core/application/use-cases/billing-template-preferences/get-billing-template-preferences.use-case';
import { UpdateBillingTemplatePreferencesUseCase } from 'src/app/core/application/use-cases/billing-template-preferences/update-billing-template-preferences.use-case';
import { UploadLogoUseCase } from 'src/app/core/application/use-cases/billing-template-preferences/upload-logo.use-case';

@Component({
  selector: 'app-company-setting',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    TablerIconsModule
  ],
  templateUrl: './company.component.html',
  styleUrl: './company.component.scss'
})
export class CompanySettingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  companyForm: FormGroup;
  companyPreferences: BillingTemplatePreference | null = null;

  private getBillingPrefs = inject(GetBillingTemplatePreferencesUseCase);
  private updateBillingPrefs = inject(UpdateBillingTemplatePreferencesUseCase);
  private uploadLogoUseCase = inject(UploadLogoUseCase);

  constructor() {
    this.companyForm = this.fb.group({
      nit: [''],
      companyName: ['', [Validators.required]],
      address: [''],
      phone1: [''],
      phone2: [''],
      email: ['', [Validators.email]],
      website: [''],
      logoUrl: [null]
    });
  }

  ngOnInit(): void {
    this.loadCompanyPreferences();
  }

  loadCompanyPreferences() {
    this.getBillingPrefs.execute().subscribe({
      next: (prefs) => {
        this.companyPreferences = prefs;
        this.companyForm.patchValue({
          nit: prefs.nit || '',
          companyName: prefs.companyName || '',
          address: prefs.address || '',
          phone1: prefs.phone1 || '',
          phone2: prefs.phone2 || '',
          email: prefs.email || '',
          website: prefs.website || '',
          logoUrl: prefs.logoUrl
        });
      }
    });
  }

  saveCompanyProfile() {
    if (this.companyForm.invalid) return;

    this.updateBillingPrefs.execute(this.companyForm.value).subscribe({
      next: (updated) => {
        this.companyPreferences = updated;
        this.snackBar.open('Información de empresa actualizada', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al actualizar empresa', 'Cerrar', { duration: 3000 });
      }
    });
  }

  onLogoSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      this.snackBar.open('El logo es demasiado grande (máximo 1MB)', 'Cerrar', { duration: 3000 });
      return;
    }

    this.uploadLogoUseCase.execute(file).subscribe({
      next: (res) => {
        this.companyForm.patchValue({ logoUrl: res.url });
        if (this.companyPreferences) {
          this.companyPreferences.logoUrl = res.url;
        }
        this.snackBar.open('Logo de empresa actualizado', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al subir logo', 'Cerrar', { duration: 3000 });
      }
    });
  }

  resetLogo() {
    this.updateBillingPrefs.execute({ logoUrl: null }).subscribe({
      next: (updated) => {
        this.companyPreferences = updated;
        this.companyForm.patchValue({ logoUrl: null });
        this.snackBar.open('Logo de empresa eliminado', 'Cerrar', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Error al eliminar logo', 'Cerrar', { duration: 3000 });
      }
    });
  }
}
