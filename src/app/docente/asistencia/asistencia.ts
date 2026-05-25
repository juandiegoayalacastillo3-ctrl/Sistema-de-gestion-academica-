// Comentario general: este archivo hace parte del sistema academico. Se comenta para que sea facil explicar su responsabilidad en la sustentacion.
// Archivo: .\src\app\docente\asistencia\asistencia.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { AuthService } from '../../core/services/auth';
import { AcademicoService, Curso, EstudianteAcademico } from '../../core/services/academico';

@Component({
  selector: 'app-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './asistencia.html',
  styleUrl: './asistencia.css'
})
export class AsistenciaComponent {
  // Se inyectan servicios para consultar rol y modificar asistencia.
  public auth = inject(AuthService);
  public academico = inject(AcademicoService);

  fecha = new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  guardado = false;
  cursoFiltro: Curso | 'Todos' = 'Todos';

  // Lista reactiva: cambia cuando se agrega, elimina o mueve un estudiante.
  estudiantes$ = this.academico.estudiantes$.pipe(
    map(estudiantes => estudiantes.filter(e => this.cursoFiltro === 'Todos' || e.curso === this.cursoFiltro))
  );

  get puedeEditar(): boolean {
    // El estudiante y el padre solo consultan; no modifican asistencia.
    return this.auth.getRol() === 'docente' || this.auth.getRol() === 'directivo';
  }

  presentes(estudiantes: EstudianteAcademico[]): number {
    // Cuenta cuantos estudiantes estan presentes en la lista filtrada.
    return estudiantes.filter(e => e.presente).length;
  }

  ausentes(estudiantes: EstudianteAcademico[]): number {
    return estudiantes.filter(e => !e.presente).length;
  }

  porcentaje(estudiantes: EstudianteAcademico[]): number {
    // Calcula porcentaje evitando division por cero cuando no hay estudiantes.
    return estudiantes.length ? Math.round((this.presentes(estudiantes) / estudiantes.length) * 100) : 0;
  }

  toggleAsistencia(e: EstudianteAcademico): void {
    // Si el rol no tiene permiso, se sale sin hacer cambios.
    if (!this.puedeEditar) return;
    this.academico.setAsistencia(e.id, !e.presente);
  }

  guardar(): void {
    // Como es local, el cambio ya queda aplicado; este mensaje solo confirma al usuario.
    this.guardado = true;
    setTimeout(() => this.guardado = false, 2500);
  }
}
