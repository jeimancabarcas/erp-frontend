import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { TablerIconsModule } from 'angular-tabler-icons';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
    selector: 'app-account-setting',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatIconModule,
        TablerIconsModule,
        MatTabsModule,
        MatFormFieldModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatInputModule,
        MatButtonModule,
        MatDividerModule,
        MatSnackBarModule
    ],
    templateUrl: './account.component.html'
})
export class AppAccountSettingComponent implements OnInit {
    private fb = inject(FormBuilder);
    private snackBar = inject(MatSnackBar);
    authService = inject(AuthService);

    profileForm: FormGroup;
    securityForm: FormGroup;

    constructor() {
        const user = this.authService.currentUser();

        this.profileForm = this.fb.group({
            fullName: [user?.profile?.fullName || '', [Validators.required]],
            address: [user?.profile?.address || ''],
            phone: [user?.profile?.phone || ''],
            displayName: [user?.profile?.displayName || ''],
        });

        this.securityForm = this.fb.group({
            currentPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]],
        }, { validators: this.passwordsMatchValidator });
    }

    ngOnInit(): void { }

    passwordsMatchValidator(g: FormGroup) {
        return g.get('newPassword')?.value === g.get('confirmPassword')?.value
            ? null : { mismatch: true };
    }

    saveProfile() {
        if (this.profileForm.invalid) return;

        this.authService.updateProfile(this.profileForm.value).subscribe({
            next: () => {
                this.snackBar.open('Perfil actualizado con éxito', 'Cerrar', { duration: 3000 });
            },
            error: (err) => {
                this.snackBar.open(err.error?.message || 'Error al actualizar perfil', 'Cerrar', { duration: 3000 });
            }
        });
    }

    onFileSelected(event: any) {
        const file: File = event.target.files[0];
        if (!file) return;

        if (file.size > 800 * 1024) {
            this.snackBar.open('El archivo es demasiado grande (máximo 800KB)', 'Cerrar', { duration: 3000 });
            return;
        }

        this.authService.uploadAvatar(file).subscribe({
            next: () => {
                this.snackBar.open('Foto de perfil actualizada', 'Cerrar', { duration: 3000 });
            },
            error: (err) => {
                this.snackBar.open(err.error?.message || 'Error al subir imagen', 'Cerrar', { duration: 3000 });
            }
        });
    }

    resetAvatar() {
        this.authService.updateProfile({ avatarUrl: null } as any).subscribe({
            next: () => {
                this.snackBar.open('Foto de perfil restablecida', 'Cerrar', { duration: 3000 });
            },
            error: (err) => {
                this.snackBar.open(err.error?.message || 'Error al restablecer imagen', 'Cerrar', { duration: 3000 });
            }
        });
    }

    updatePassword() {
        if (this.securityForm.invalid) return;

        const { currentPassword, newPassword } = this.securityForm.value;
        this.authService.changePassword({ currentPassword, newPassword }).subscribe({
            next: () => {
                this.snackBar.open('Contraseña cambiada con éxito', 'Cerrar', { duration: 3000 });
                this.securityForm.reset();
            },
            error: (err) => {
                this.snackBar.open(err.error?.message || 'Error al cambiar contraseña', 'Cerrar', { duration: 3000 });
            }
        });
    }
}
