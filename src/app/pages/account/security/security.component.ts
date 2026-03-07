import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TablerIconsModule } from 'angular-tabler-icons';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-security-setting',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    TablerIconsModule
  ],
  templateUrl: './security.component.html',
  styleUrl: './security.component.scss'
})
export class SecuritySettingComponent {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private authService = inject(AuthService);

  securityForm: FormGroup;

  constructor() {
    this.securityForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordsMatchValidator });
  }

  passwordsMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
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
