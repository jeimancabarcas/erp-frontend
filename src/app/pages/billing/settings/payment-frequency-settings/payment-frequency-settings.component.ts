import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { TablerIconsModule } from 'angular-tabler-icons';
import { lastValueFrom } from 'rxjs';

import { BillingPaymentFrequency } from '../../../../core/domain/entities/billing-payment-frequency.entity';
import { GetBillingPaymentFrequenciesUseCase } from '../../../../core/application/use-cases/get-billing-payment-frequencies.use-case';
import { DeleteBillingPaymentFrequencyUseCase } from '../../../../core/application/use-cases/delete-billing-payment-frequency.use-case';
import { ToastService } from '../../../../core/services/toast.service';
import { TableEmptyComponent } from '../../../../shared/components/table-empty/table-empty.component';
import { TableLoadingComponent } from '../../../../shared/components/table-loading/table-loading.component';
import { PaymentFrequencyFormComponent } from '../payment-frequency-form/payment-frequency-form.component';

@Component({
    selector: 'app-payment-frequency-settings',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatDialogModule,
        TablerIconsModule,
        TableEmptyComponent,
        TableLoadingComponent
    ],
    templateUrl: './payment-frequency-settings.component.html',
    styleUrl: './payment-frequency-settings.component.scss'
})
export class PaymentFrequencySettingsComponent implements OnInit {
    private getFrequenciesUseCase = inject(GetBillingPaymentFrequenciesUseCase);
    private deleteFrequencyUseCase = inject(DeleteBillingPaymentFrequencyUseCase);
    private toast = inject(ToastService);
    private dialog = inject(MatDialog);

    public frequencies = signal<BillingPaymentFrequency[]>([]);
    public isLoading = signal(false);

    ngOnInit() {
        this.loadFrequencies();
    }

    private loadFrequencies() {
        this.isLoading.set(true);
        this.getFrequenciesUseCase.execute().subscribe({
            next: (data) => {
                this.frequencies.set(data || []);
                this.isLoading.set(false);
            },
            error: (err) => {
                this.toast.error('Error al cargar frecuencias');
                console.error(err);
                this.isLoading.set(false);
            }
        });
    }

    openForm(frequency?: BillingPaymentFrequency) {
        const dialogRef = this.dialog.open(PaymentFrequencyFormComponent, {
            width: '400px',
            data: frequency,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadFrequencies();
            }
        });
    }

    async deleteFrequency(frequency: BillingPaymentFrequency) {
        if (confirm(`¿Estás seguro de eliminar la frecuencia "${frequency.name}"?`)) {
            try {
                await lastValueFrom(this.deleteFrequencyUseCase.execute(frequency.id));
                this.toast.success('Frecuencia eliminada correctamente');
                this.loadFrequencies();
            } catch (err: any) {
                this.toast.error('Error al eliminar la frecuencia');
            }
        }
    }
}
