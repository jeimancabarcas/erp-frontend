import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BillingTemplatePreference } from '../../../domain/entities/billing-template-preference.entity';
import { BillingTemplatePreferenceRepository } from '../../../domain/repositories/billing-template-preference.repository';

@Injectable({
    providedIn: 'root'
})
export class GetBillingTemplatePreferencesUseCase {
    private repository = inject(BillingTemplatePreferenceRepository);

    execute(): Observable<BillingTemplatePreference> {
        return this.repository.getPreference();
    }
}
