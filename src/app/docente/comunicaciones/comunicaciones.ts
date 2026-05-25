// Comentario general: este archivo hace parte del sistema academico. Se comenta para que sea facil explicar su responsabilidad en la sustentacion.
// Archivo: .\src\app\docente\comunicaciones\comunicaciones.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { AcademicoService, TipoComunicado } from '../../core/services/academico';

@Component({
  selector: 'app-comunicados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comunicaciones.html',
  styleUrl: './comunicaciones.css'
})
export class ComunicadosComponent {
  // Auth valida permisos; AcademicoService guarda y lista comunicados.
  public auth = inject(AuthService);
  public academico = inject(AcademicoService);

  nuevoTitulo = '';
  nuevoMensaje = '';
  nuevoDestinatario = 'Todos los padres';
  nuevoTipo: TipoComunicado = 'info';
  enviado = false;

  // Observable que alimenta la lista de comunicados en pantalla.
  comunicados$ = this.academico.comunicados$;

  puedeEnviar(): boolean {
    // Solo personal academico puede publicar comunicados.
    return this.auth.getRol() === 'docente' || this.auth.getRol() === 'directivo';
  }

  getBorderColor(tipo: string): string {
    if (tipo === 'alerta') return '#f59e0b';
    if (tipo === 'urgente') return '#ef4444';
    return '#3b82f6';
  }

  getBadgeClass(tipo: string): string {
    if (tipo === 'alerta') return 'bg-warning text-dark';
    if (tipo === 'urgente') return 'bg-danger';
    return 'bg-primary';
  }

  enviar(): void {
    // Validacion simple: si no hay permiso o faltan campos, no envia.
    if (!this.puedeEnviar() || !this.nuevoTitulo.trim() || !this.nuevoMensaje.trim()) return;
    // Se delega el guardado al servicio para mantener el componente liviano.
    this.academico.enviarComunicado({
      titulo: this.nuevoTitulo.trim(),
      mensaje: this.nuevoMensaje.trim(),
      destinatario: this.nuevoDestinatario,
      tipo: this.nuevoTipo,
      autor: this.auth.getUsuario()?.nombre ?? 'Sistema',
    });
    // Limpia el formulario despues de publicar.
    this.nuevoTitulo = '';
    this.nuevoMensaje = '';
    this.enviado = true;
    setTimeout(() => this.enviado = false, 2500);
  }
}
