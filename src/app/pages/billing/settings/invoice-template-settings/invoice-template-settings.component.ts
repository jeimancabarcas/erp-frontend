import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GetBillingTemplatePreferencesUseCase } from '../../../../core/application/use-cases/billing-template-preferences/get-billing-template-preferences.use-case';
import { UpdateBillingTemplatePreferencesUseCase } from '../../../../core/application/use-cases/billing-template-preferences/update-billing-template-preferences.use-case';
import { ToastService } from '../../../../core/services/toast.service';
import { TableLoadingComponent } from '../../../../shared/components/table-loading/table-loading.component';

@Component({
  selector: 'app-invoice-template-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    TablerIconsModule,
    ReactiveFormsModule,
    TableLoadingComponent
  ],
  templateUrl: './invoice-template-settings.component.html',
  styleUrl: './invoice-template-settings.component.scss'
})
export class InvoiceTemplateSettingsComponent implements OnInit {
  private getPreferencesUseCase = inject(GetBillingTemplatePreferencesUseCase);
  private updatePreferencesUseCase = inject(UpdateBillingTemplatePreferencesUseCase);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  public templateForm: FormGroup;
  public isPreferencesLoading = signal(false);
  public isPreferencesSaving = signal(false);

  constructor() {
    this.templateForm = this.fb.group({
      primaryColor: ['#2dd4bf', Validators.required],
      secondaryColor: ['#14b8a6', Validators.required],
      logoUrl: [null]
    });
  }

  ngOnInit() {
    this.loadPreferences();
  }

  private loadPreferences() {
    this.isPreferencesLoading.set(true);
    this.getPreferencesUseCase.execute().subscribe({
      next: (data) => {
        if (data) {
          this.templateForm.patchValue(data);
        }
        this.isPreferencesLoading.set(false);
      },
      error: (err) => {
        this.toast.error('Error al cargar preferencias de plantilla');
        console.error(err);
        this.isPreferencesLoading.set(false);
      }
    });
  }

  public savePreferences() {
    if (this.templateForm.invalid) return;

    this.isPreferencesSaving.set(true);
    this.updatePreferencesUseCase.execute(this.templateForm.value).subscribe({
      next: (data) => {
        this.toast.success('Preferencias de plantilla guardadas');
        this.templateForm.patchValue(data);
        this.isPreferencesSaving.set(false);
      },
      error: (err) => {
        this.toast.error('Error al guardar las preferencias');
        console.error(err);
        this.isPreferencesSaving.set(false);
      }
    });
  }
}
