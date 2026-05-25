// Comentario general: este archivo hace parte del sistema academico. Se comenta para que sea facil explicar su responsabilidad en la sustentacion.
// Archivo: .\src\app\core\services\auth.ts

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, delay, of, tap, throwError } from 'rxjs';

export interface Usuario {
  // Esta interfaz define la forma que debe tener un usuario dentro de la app.
  // Sirve para que TypeScript avise si falta un dato como email, rol o iniciales.
  id: number;
  nombre: string;
  email: string;
  rol: 'docente' | 'directivo' | 'padre' | 'estudiante';
  iniciales: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  rol: Usuario['rol'];
}

// Base de datos local simulada.
// Para la entrega se usa este arreglo en vez de backend, asi el sistema funciona estable.
const USUARIOS: (Usuario & { password: string })[] = [
  { id: 1, nombre: 'Carlos Rodriguez', email: 'docente@sge.com', password: '123456', rol: 'docente', iniciales: 'CR' },
  { id: 2, nombre: 'Ana Martinez', email: 'directivo@sge.com', password: '123456', rol: 'directivo', iniciales: 'AM' },

  { id: 101, nombre: 'Valentina Ospina', email: 'v.ospina@sge.com', password: '123456', rol: 'estudiante', iniciales: 'VO' },
  { id: 102, nombre: 'Sebastian Mora', email: 's.mora@sge.com', password: '123456', rol: 'estudiante', iniciales: 'SM' },
  { id: 103, nombre: 'Luisa Fernandez', email: 'l.fernandez@sge.com', password: '123456', rol: 'estudiante', iniciales: 'LF' },
  { id: 104, nombre: 'Diego Salcedo', email: 'd.salcedo@sge.com', password: '123456', rol: 'estudiante', iniciales: 'DS' },
  { id: 105, nombre: 'Mariana Rios', email: 'estudiante@sge.com', password: '123456', rol: 'estudiante', iniciales: 'MR' },
  { id: 106, nombre: 'Andres Gomez', email: 'a.gomez@sge.com', password: '123456', rol: 'estudiante', iniciales: 'AG' },
  { id: 107, nombre: 'Camila Herrera', email: 'c.herrera@sge.com', password: '123456', rol: 'estudiante', iniciales: 'CH' },
  { id: 108, nombre: 'Juan Pablo Torres', email: 'jp.torres@sge.com', password: '123456', rol: 'estudiante', iniciales: 'JT' },

  { id: 201, nombre: 'Maria Ospina', email: 'padre@sge.com', password: '123456', rol: 'padre', iniciales: 'MO' },
  { id: 202, nombre: 'Carlos Mora', email: 'c.mora@sge.com', password: '123456', rol: 'padre', iniciales: 'CM' },
  { id: 203, nombre: 'Pedro Fernandez', email: 'p.fernandez@sge.com', password: '123456', rol: 'padre', iniciales: 'PF' },
  { id: 204, nombre: 'Ana Salcedo', email: 'a.salcedo@sge.com', password: '123456', rol: 'padre', iniciales: 'AS' },
  { id: 205, nombre: 'Jorge Rios', email: 'j.rios@sge.com', password: '123456', rol: 'padre', iniciales: 'JR' },
  { id: 206, nombre: 'Laura Gomez', email: 'l.gomez@sge.com', password: '123456', rol: 'padre', iniciales: 'LG' },
  { id: 207, nombre: 'Rosa Herrera', email: 'r.herrera@sge.com', password: '123456', rol: 'padre', iniciales: 'RH' },
  { id: 208, nombre: 'Luis Torres', email: 'l.torres@sge.com', password: '123456', rol: 'padre', iniciales: 'LT' },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Guarda el usuario que inicio sesion. Si es null, significa que no hay sesion activa.
  private usuarioActual: Usuario | null = null;

  constructor(private router: Router) {
    // Al abrir o recargar la pagina, intentamos recuperar la sesion guardada.
    const guardado = localStorage.getItem('sge_usuario');
    if (guardado) {
      this.usuarioActual = JSON.parse(guardado) as Usuario;
    }
  }

  login(email: string, password: string): Observable<Usuario> {
    // Busca coincidencia por correo y contrasena en la lista local de usuarios.
    const encontrado = USUARIOS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!encontrado) {
      // throwError simula un error de autenticacion como lo haria una API real.
      return throwError(() => new Error('Credenciales invalidas')).pipe(delay(300));
    }

    // Quitamos la contrasena antes de guardar el usuario en la sesion.
    const { password: _, ...usuario } = encontrado;
    return of(usuario).pipe(
      // delay solo da una pequena sensacion de carga para que el login no se vea instantaneo.
      delay(300),
      tap(user => this.guardarSesion(user)),
    );
  }

  register(data: RegisterRequest): Observable<Usuario> {
    // Evita registrar dos usuarios con el mismo correo.
    const existe = USUARIOS.some(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existe) {
      return throwError(() => new Error('El correo ya esta registrado')).pipe(delay(300));
    }

    const usuario: Usuario = {
      id: Date.now(),
      nombre: data.nombre.trim(),
      email: data.email.trim().toLowerCase(),
      rol: data.rol,
      iniciales: this.crearIniciales(data.nombre),
    };

    USUARIOS.push({ ...usuario, password: data.password });
    return of(usuario).pipe(delay(300));
  }

  logout(): void {
    // Cierra la sesion local y manda al usuario otra vez al login.
    this.usuarioActual = null;
    localStorage.removeItem('sge_usuario');
    this.router.navigate(['/auth/login']);
  }

  getUsuario(): Usuario | null { return this.usuarioActual; }
  // Estos metodos pequenos los usan componentes, guards y sidebar para consultar el estado actual.
  estaAutenticado(): boolean { return !!this.usuarioActual; }
  getRol(): string { return this.usuarioActual?.rol ?? ''; }

  private guardarSesion(usuario: Usuario): void {
    // localStorage permite que la sesion sobreviva si el usuario recarga la pagina.
    this.usuarioActual = usuario;
    localStorage.setItem('sge_usuario', JSON.stringify(usuario));
  }

  private crearIniciales(nombre: string): string {
    // Toma las primeras letras del nombre para pintar el avatar del usuario.
    const partes = nombre.trim().split(/\s+/).slice(0, 2);
    return partes.map(parte => parte.charAt(0).toUpperCase()).join('');
  }
}
