import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../interfaces/api-response.interface';

export interface User {
    id: string;
    email: string;
    profile: {
        id: string;
        displayName: string;
        fullName: string;
        address: string;
        phone: string;
        userId: string;
    } | null;
}

export interface AuthResponse {
    accessToken: string;
    user: User;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly apiUrl = `${environment.apiUrl}/auth`;
    private readonly TOKEN_KEY = 'token';
    private readonly USER_KEY = 'user';

    currentUser = signal<User | null>(this.getUserFromStorage());

    constructor(private http: HttpClient) { }

    login(credentials: { email: string; password: string }): Observable<AuthResponse> {
        return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials).pipe(
            map(response => response.data),
            tap((data) => {
                this.setSession(data);
            })
        );
    }

    updateProfile(dto: Partial<User['profile']>): Observable<void> {
        return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/profile`, dto).pipe(
            map(() => {
                const current = this.currentUser();
                if (current) {
                    const updatedUser = {
                        ...current,
                        profile: { ...current.profile, ...dto } as any
                    };
                    localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
                    this.currentUser.set(updatedUser);
                }
            })
        );
    }

    changePassword(dto: any): Observable<void> {
        return this.http.post<ApiResponse<void>>(`${this.apiUrl}/change-password`, dto).pipe(
            map(response => response.data)
        );
    }

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.currentUser.set(null);
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    private setSession(authResult: AuthResponse): void {
        localStorage.setItem(this.TOKEN_KEY, authResult.accessToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
        this.currentUser.set(authResult.user);
    }

    private getUserFromStorage(): User | null {
        const user = localStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
    }
}
