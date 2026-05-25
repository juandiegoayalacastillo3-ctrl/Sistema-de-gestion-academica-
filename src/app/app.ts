// Comentario general: este archivo hace parte del sistema academico.
// Es el componente raiz: decide si se muestra el login o el layout principal.
// Archivo: .\src\app\app.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth';
import { NavbarComponent }  from './shared/components/navbar/navbar';
import { SidebarComponent } from './shared/components/sidebar/sidebar';
import { FooterComponent }  from './shared/components/footer/footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent, FooterComponent],
  templateUrl: './app.html'
})
export class AppComponent {
  // Esta bandera decide si se muestra el layout con sidebar/navbar o solo el login.
  loggedIn = false;

  constructor(private auth: AuthService, private router: Router) {
    // Verifica el estado inicial por si ya habia una sesion guardada en localStorage.
    this.loggedIn = this.auth.estaAutenticado();

    // NavigationEnd se dispara cuando Angular termina de cambiar de ruta.
    // Asi el layout responde correctamente despues de login y logout.
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.loggedIn = this.auth.estaAutenticado();
      });
  }
}
