import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingTemplatePreferenceRepository } from '../../../domain/repositories/billing-template-preference.repository';

@Injectable({
    providedIn: 'root'
})
export class UploadLogoUseCase {
    private repository = inject(BillingTemplatePreferenceRepository);

    execute(file: File): Observable<{ url: string }> {
        return this.repository.uploadLogo(file);
    }
}
