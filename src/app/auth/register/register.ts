// Archivo: .\src\app\auth\register\register.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  nombre = '';
  email = '';
  password = '';
  password2 = '';
  rol: 'docente' | 'directivo' | 'padre' | 'estudiante' = 'docente';
  error = '';
  exito = false;
  cargando = false;

  constructor(private auth: AuthService, private router: Router) {
    if (this.auth.estaAutenticado()) {
      this.router.navigate(['/docente/dashboard']);
    }
  }

  get passwordsCoinciden(): boolean {
    return this.password === this.password2;
  }

  registrar(): void {
    this.error = '';

    if (!this.nombre || !this.email || !this.password || !this.password2) {
      this.error = 'Completa todos los campos.';
      return;
    }
    if (!this.email.includes('@')) {
      this.error = 'El correo electronico no es valido.';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'La contrasena debe tener al menos 6 caracteres.';
      return;
    }
    if (!this.passwordsCoinciden) {
      this.error = 'Las contrasenas no coinciden.';
      return;
    }

    this.cargando = true;
    this.auth.register({
      nombre: this.nombre.trim(),
      email: this.email.trim().toLowerCase(),
      password: this.password,
      rol: this.rol,
    }).subscribe({
      next: () => {
        this.cargando = false;
        this.exito = true;
        setTimeout(() => this.router.navigate(['/auth/login']), 1200);
      },
      error: (error: Error) => {
        this.cargando = false;
        this.error = error.message || 'No se pudo crear la cuenta.';
      },
    });
  }
}
