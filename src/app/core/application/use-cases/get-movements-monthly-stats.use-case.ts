import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MovementRepository, MovementMonthlyStats } from '../../domain/repositories/movement.repository';

@Injectable({
    providedIn: 'root'
})
export class GetMovementsMonthlyStatsUseCase {
    constructor(private movementRepository: MovementRepository) { }

    execute(): Observable<MovementMonthlyStats> {
        return this.movementRepository.getMonthlyStats();
    }
}
