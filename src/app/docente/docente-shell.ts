// Comentario general: este archivo hace parte del sistema academico. Se comenta para que sea facil explicar su responsabilidad en la sustentacion.
// Archivo: .\src\app\docente\docente-shell.ts

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-docente-shell',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './docente-shell.html'
})
export class DocenteShellComponent {}
