// Comentario general: este archivo hace parte del sistema academico. Se comenta para que sea facil explicar su responsabilidad en la sustentacion.
// Archivo: .\src\app\app.routes.ts

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  // Ruta inicial: si entran a la raiz, se manda al login.
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full' as const
  },
  {
    // Modulo de autenticacion: contiene login y registro.
    path: 'auth',
    loadChildren: () => import('./auth/auth-module').then(m => m.AuthModule)
  },
  {
    // Modulo principal del sistema. El guard evita entrar sin iniciar sesion.
    path: 'docente',
    canActivate: [authGuard],
    loadChildren: () => import('./docente/docente-module').then(m => m.DocenteModule)
  },
  // Comodin: cualquier URL desconocida vuelve al login.
  { path: '**', redirectTo: 'auth/login' }
];
