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
        displayName: string | null;
        fullName: string;
        address: string | null;
        phone: string | null;
        position: string | null;
        identificationNumber: string | null;
        identificationType: string | null;
        avatarUrl: string | null;
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
                    let avatarUrl = dto?.avatarUrl;
                    if (avatarUrl && !avatarUrl.startsWith('http')) {
                        avatarUrl = `${environment.apiUrl}${avatarUrl}`;
                    }
                    const updatedUser = {
                        ...current,
                        profile: { ...current.profile, ...dto, avatarUrl: avatarUrl !== undefined ? avatarUrl : current.profile?.avatarUrl } as any
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

    uploadAvatar(file: File): Observable<{ url: string }> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<ApiResponse<{ url: string }>>(`${this.apiUrl}/upload-avatar`, formData).pipe(
            map(response => response.data),
            tap((data) => {
                const current = this.currentUser();
                if (current) {
                    const fullUrl = data.url.startsWith('http') ? data.url : `${environment.apiUrl}${data.url}`;
                    const updatedUser = {
                        ...current,
                        profile: { ...current.profile, avatarUrl: fullUrl } as any
                    };
                    localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
                    this.currentUser.set(updatedUser);
                }
            })
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
        if (authResult.user.profile?.avatarUrl && !authResult.user.profile.avatarUrl.startsWith('http')) {
            authResult.user.profile.avatarUrl = `${environment.apiUrl}${authResult.user.profile.avatarUrl}`;
        }
        localStorage.setItem(this.TOKEN_KEY, authResult.accessToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
        this.currentUser.set(authResult.user);
    }

    private getUserFromStorage(): User | null {
        const userStr = localStorage.getItem(this.USER_KEY);
        if (!userStr) return null;
        const user = JSON.parse(userStr);
        if (user.profile?.avatarUrl && !user.profile.avatarUrl.startsWith('http')) {
            user.profile.avatarUrl = `${environment.apiUrl}${user.profile.avatarUrl}`;
        }
        return user;
    }
}
