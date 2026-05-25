// Archivo: .\src\app\auth\login\login.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  // Variables conectadas al formulario mediante ngModel.
  email = '';
  password = '';
  error = '';
  cargando = false;

  // Botones de ayuda para llenar credenciales demo rapido durante la sustentacion.
  usuarios = [
    { rol: 'Docente', email: 'docente@sge.com', pass: '123456' },
    { rol: 'Directivo', email: 'directivo@sge.com', pass: '123456' },
    { rol: 'Valentina', email: 'v.ospina@sge.com', pass: '123456' },
    { rol: 'Sebastian', email: 's.mora@sge.com', pass: '123456' },
    { rol: 'Luisa', email: 'l.fernandez@sge.com', pass: '123456' },
    { rol: 'Diego', email: 'd.salcedo@sge.com', pass: '123456' },
    { rol: 'Mariana', email: 'estudiante@sge.com', pass: '123456' },
    { rol: 'Andres', email: 'a.gomez@sge.com', pass: '123456' },
    { rol: 'Camila', email: 'c.herrera@sge.com', pass: '123456' },
    { rol: 'Juan Pablo', email: 'jp.torres@sge.com', pass: '123456' },
    { rol: 'Acud. Valentina', email: 'padre@sge.com', pass: '123456' },
    { rol: 'Acud. Sebastian', email: 'c.mora@sge.com', pass: '123456' },
    { rol: 'Acud. Luisa', email: 'p.fernandez@sge.com', pass: '123456' },
    { rol: 'Acud. Diego', email: 'a.salcedo@sge.com', pass: '123456' },
    { rol: 'Acud. Mariana', email: 'j.rios@sge.com', pass: '123456' },
    { rol: 'Acud. Andres', email: 'l.gomez@sge.com', pass: '123456' },
    { rol: 'Acud. Camila', email: 'r.herrera@sge.com', pass: '123456' },
    { rol: 'Acud. Juan', email: 'l.torres@sge.com', pass: '123456' },
  ];

  private returnUrl = '/docente/dashboard';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Si el usuario ya inicio sesion y vuelve al login, lo mandamos al dashboard.
    if (this.auth.estaAutenticado()) {
      this.redirigirPorRol();
    }
    // returnUrl permite volver a la pagina que el usuario intento abrir antes del login.
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/docente/dashboard';
  }

  llenar(email: string, pass: string): void {
    // Carga credenciales demo en los inputs.
    this.email = email;
    this.password = pass;
    this.error = '';
  }

  iniciarSesion(): void {
    // Validacion basica antes de llamar al servicio.
    this.error = '';
    if (!this.email || !this.password) {
      this.error = 'Completa todos los campos.';
      return;
    }

    this.cargando = true;
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => {
        // Si el login es correcto, navegamos a la ruta esperada.
        this.cargando = false;
        if (this.returnUrl) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.redirigirPorRol();
        }
      },
      error: () => {
        // Si falla, se muestra un mensaje entendible al usuario.
        this.cargando = false;
        this.error = 'Correo o contrasena incorrectos.';
      },
    });
  }

  private redirigirPorRol(): void {
    // Todos los roles entran al mismo modulo, pero la interfaz se adapta por permisos.
    const rol = this.auth.getRol();
    switch (rol) {
      case 'docente':
      case 'directivo':
      case 'padre':
      case 'estudiante':
        this.router.navigate(['/docente/dashboard']);
        break;
      default:
        this.router.navigate(['/docente/dashboard']);
    }
  }
}
