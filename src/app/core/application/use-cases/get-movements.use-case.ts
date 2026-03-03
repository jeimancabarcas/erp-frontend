import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MovementRepository, MovementsQuery, MovementsListResponse } from '../../domain/repositories/movement.repository';

@Injectable({
    providedIn: 'root'
})
export class GetMovementsUseCase {
    constructor(private movementRepository: MovementRepository) { }

    execute(query?: MovementsQuery): Observable<MovementsListResponse> {
        return this.movementRepository.getMovements(query);
    }
}
