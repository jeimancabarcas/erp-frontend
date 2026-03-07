import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TablerIconsModule } from 'angular-tabler-icons';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-profile-setting',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    TablerIconsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileSettingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  authService = inject(AuthService);

  profileForm: FormGroup;

  constructor() {
    const user = this.authService.currentUser();
    this.profileForm = this.fb.group({
      fullName: [user?.profile?.fullName || '', [Validators.required]],
      address: [user?.profile?.address || ''],
      phone: [user?.profile?.phone || ''],
      displayName: [user?.profile?.displayName || ''],
      position: [user?.profile?.position || ''],
      identificationNumber: [user?.profile?.identificationNumber || ''],
      identificationType: [user?.profile?.identificationType || ''],
    });
  }

  ngOnInit(): void { }

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
}
