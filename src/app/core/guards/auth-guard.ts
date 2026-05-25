// Comentario general: este archivo hace parte del sistema academico. Se comenta para que sea facil explicar su responsabilidad en la sustentacion.
// Archivo: .\src\app\core\guards\auth-guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  // inject se usa porque este guard es una funcion, no una clase con constructor.
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.estaAutenticado()) {
    // Si hay usuario en sesion, Angular deja pasar a la ruta protegida.
    return true;
  }

  // Si no hay sesion, se guarda la URL que queria abrir para poder volver despues del login.
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
