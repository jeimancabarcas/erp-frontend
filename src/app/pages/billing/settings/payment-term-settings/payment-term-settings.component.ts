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

import { BillingPaymentTerm } from '../../../../core/domain/entities/billing-payment-term.entity';
import { GetBillingPaymentTermsUseCase } from '../../../../core/application/use-cases/get-billing-payment-terms.use-case';
import { DeleteBillingPaymentTermUseCase } from '../../../../core/application/use-cases/delete-billing-payment-term.use-case';
import { ToastService } from '../../../../core/services/toast.service';
import { TableEmptyComponent } from '../../../../shared/components/table-empty/table-empty.component';
import { TableLoadingComponent } from '../../../../shared/components/table-loading/table-loading.component';
import { PaymentTermFormComponent } from '../payment-term-form/payment-term-form.component';

@Component({
    selector: 'app-payment-term-settings',
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
    templateUrl: './payment-term-settings.component.html',
    styleUrl: './payment-term-settings.component.scss'
})
export class PaymentTermSettingsComponent implements OnInit {
    private getTermsUseCase = inject(GetBillingPaymentTermsUseCase);
    private deleteTermUseCase = inject(DeleteBillingPaymentTermUseCase);
    private toast = inject(ToastService);
    private dialog = inject(MatDialog);

    public terms = signal<BillingPaymentTerm[]>([]);
    public isLoading = signal(false);

    ngOnInit() {
        this.loadTerms();
    }

    private loadTerms() {
        this.isLoading.set(true);
        this.getTermsUseCase.execute().subscribe({
            next: (data) => {
                this.terms.set(data || []);
                this.isLoading.set(false);
            },
            error: (err) => {
                this.toast.error('Error al cargar plazos');
                console.error(err);
                this.isLoading.set(false);
            }
        });
    }

    openForm(term?: BillingPaymentTerm) {
        const dialogRef = this.dialog.open(PaymentTermFormComponent, {
            width: '400px',
            data: term,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.loadTerms();
            }
        });
    }

    async deleteTerm(term: BillingPaymentTerm) {
        if (confirm(`¿Estás seguro de eliminar el plazo "${term.name}"?`)) {
            try {
                await lastValueFrom(this.deleteTermUseCase.execute(term.id));
                this.toast.success('Plazo eliminado correctamente');
                this.loadTerms();
            } catch (err: any) {
                this.toast.error('Error al eliminar el plazo');
            }
        }
    }
}
