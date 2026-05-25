// Comentario general: este archivo hace parte del sistema academico. Se comenta para que sea facil explicar su responsabilidad en la sustentacion.
// Archivo: .\src\app\shared\components\badge-estado\badge-estado.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge-estado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge-estado.component.html'
})
export class BadgeEstadoComponent {
  @Input() estado: 'Aprobado' | 'Reprobado' | 'Pendiente' = 'Pendiente';
}
