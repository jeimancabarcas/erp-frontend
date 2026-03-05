import { Observable } from 'rxjs';
import { BillingTemplatePreference } from '../entities/billing-template-preference.entity';

export abstract class BillingTemplatePreferenceRepository {
    abstract getPreference(): Observable<BillingTemplatePreference>;
    abstract updatePreference(preference: Partial<BillingTemplatePreference>): Observable<BillingTemplatePreference>;
}
