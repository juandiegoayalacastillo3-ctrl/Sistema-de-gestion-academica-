// Archivo: .\src\app\docente\dashboard\dashboard.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { combineLatest, map } from 'rxjs';
import { AuthService } from '../../core/services/auth';
import { AcademicoService, EstudianteAcademico, Nota } from '../../core/services/academico';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  // Servicios principales: auth para saber quien entro, academico para traer datos.
  public auth = inject(AuthService);
  public academico = inject(AcademicoService);

  vm$ = combineLatest([this.academico.estudiantes$, this.academico.notas$, this.academico.comunicados$]).pipe(
    map(([estudiantes, notas, comunicados]) => {
      // vm significa ViewModel: objeto preparado especialmente para la vista HTML.
      const usuario = this.auth.getUsuario();
      const rol = usuario?.rol ?? 'docente';
      // Segun el rol, no todos pueden ver todos los estudiantes.
      const visibles = this.estudiantesVisibles(estudiantes);
      const notasVisibles = this.notasVisibles(notas, visibles);
      const promedio = notasVisibles.length
        ? +(notasVisibles.reduce((sum, n) => sum + this.academico.promedioNota(n), 0) / notasVisibles.length).toFixed(1)
        : 0;
      const presentes = visibles.filter(e => e.presente).length;

      return {
        rol,
        usuario,
        estudiantes: visibles,
        comunicados: comunicados.slice(0, 3),
        notas: [...notasVisibles].sort((a, b) => b.ultimaModificacion - a.ultimaModificacion || Number(b.periodo) - Number(a.periodo)).slice(0, 6),
        promedio,
        // Tarjetas resumen que se pintan en el dashboard.
        stats: [
          { label: rol === 'padre' ? 'Hijos vinculados' : 'Estudiantes', value: visibles.length, color: '#0f766e', sub: 'Activos en plataforma' },
          { label: 'Asistencia', value: visibles.length ? `${Math.round((presentes / visibles.length) * 100)}%` : '0%', color: '#2563eb', sub: `${presentes} presentes hoy` },
          { label: 'Promedio', value: promedio || 'N/A', color: '#7c2d12', sub: 'Rendimiento actual' },
          { label: 'Comunicados', value: comunicados.length, color: '#6d28d9', sub: 'Mensajes publicados' },
        ],
      };
    })
  );

  nombreEstudiante(id: number, estudiantes: EstudianteAcademico[]): string {
    // Convierte el id guardado en la nota al nombre real del estudiante.
    return estudiantes.find(e => e.id === id)?.nombre ?? 'Estudiante';
  }

  estadoNota(nota: Nota): string {
    return this.academico.estadoPromedio(this.academico.promedioNota(nota));
  }

  getEstadoClass(estado: string): string {
    return estado === 'Aprobado' ? 'badge-aprobado' : estado === 'Reprobado' ? 'badge-reprobado' : 'badge-pendiente';
  }

  private estudiantesVisibles(estudiantes: EstudianteAcademico[]): EstudianteAcademico[] {
    // Reglas de visibilidad por rol.
    const usuario = this.auth.getUsuario();
    if (usuario?.rol === 'estudiante') return estudiantes.filter(e => e.email === usuario.email);
    if (usuario?.rol === 'padre') return estudiantes.filter(e => e.acudienteEmail === usuario.email);
    return estudiantes;
  }

  private notasVisibles(notas: Nota[], estudiantes: EstudianteAcademico[]): Nota[] {
    // Filtra notas solamente de los estudiantes que ese rol puede ver.
    const ids = new Set(estudiantes.map(e => e.id));
    return notas.filter(n => ids.has(n.estudianteId));
  }
}