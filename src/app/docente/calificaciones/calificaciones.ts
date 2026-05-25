// Comentario general: este archivo hace parte del sistema academico. Se comenta para que sea facil explicar su responsabilidad en la sustentacion.
// Archivo: .\src\app\docente\calificaciones\calificaciones.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { combineLatest, map } from 'rxjs';
import { BadgeEstadoComponent } from '../../shared/components/badge-estado/badge-estado.component';
import { AuthService } from '../../core/services/auth';
import { AcademicoService, Curso, EstudianteAcademico, Materia, Nota, Periodo } from '../../core/services/academico';

@Component({
  selector: 'app-calificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, BadgeEstadoComponent],
  templateUrl: './calificaciones.html',
  styleUrl: './calificaciones.css'
})
export class CalificacionesComponent {
  // inject permite usar servicios sin declararlos en el constructor.
  public auth = inject(AuthService);
  public academico = inject(AcademicoService);

  // Valores iniciales de los filtros de la pantalla.
  materia: Materia = 'Matematicas';
  periodo: Periodo = '1';
  cursoFiltro: Curso | 'Todos' = 'Todos';
  guardado = false;

  vm$ = combineLatest([this.academico.estudiantes$, this.academico.notas$]).pipe(
    map(([estudiantes, notas]) => {
      // Primero se filtran estudiantes segun el rol: docente/directivo ven todos,
      // estudiante ve solo su registro y padre ve solo los hijos vinculados.
      const visibles = this.estudiantesVisibles(estudiantes);
      const ids = new Set(visibles.map(e => e.id));
      return {
        estudiantes: visibles,
        // Estas son las notas de la materia y periodo actualmente seleccionados.
        notas: notas.filter(n => ids.has(n.estudianteId) && n.materia === this.materia && n.periodo === this.periodo),
        todasNotas: notas.filter(n => ids.has(n.estudianteId)),
      };
    })
  );

  puedeEditar(): boolean {
    // Solo docente y directivo pueden escribir notas.
    return this.auth.getRol() === 'docente' || this.auth.getRol() === 'directivo';
  }

  filtrarEstudiantes(estudiantes: EstudianteAcademico[]): EstudianteAcademico[] {
    // Si el filtro esta en Todos, no se limita por curso.
    return estudiantes.filter(e => this.cursoFiltro === 'Todos' || e.curso === this.cursoFiltro);
  }

  notaDe(estudianteId: number, notas: Nota[]): Nota | undefined {
    // Busca la nota de un estudiante en la lista filtrada por materia y periodo.
    return notas.find(n => n.estudianteId === estudianteId);
  }

  actualizar(estudianteId: number, campo: 'nota1' | 'nota2' | 'nota3', valor: number): void {
    // Envia el cambio al servicio central para que la tabla y los promedios se actualicen.
    this.academico.actualizarNota(estudianteId, this.materia, this.periodo, campo, valor);
  }

  promedio(nota: Nota | undefined): number {
    return nota ? this.academico.promedioNota(nota) : 0;
  }

  estado(nota: Nota | undefined): 'Aprobado' | 'Reprobado' | 'Pendiente' {
    return this.academico.estadoPromedio(this.promedio(nota));
  }

  promedioGeneral(notas: Nota[]): number {
    if (!notas.length) return 0;
    return +(notas.reduce((sum, n) => sum + this.academico.promedioNota(n), 0) / notas.length).toFixed(1);
  }

  aprobados(notas: Nota[]): number {
    return notas.filter(n => this.academico.promedioNota(n) >= 3).length;
  }

  notasActuales(notas: Nota[], estudiantes: EstudianteAcademico[]): Nota[] {
    // Corrige el conteo para que no tome todas las materias, sino solo lo visible.
    const ids = new Set(this.filtrarEstudiantes(estudiantes).map(e => e.id));
    return notas.filter(n => ids.has(n.estudianteId));
  }

  promedioActual(notas: Nota[], estudiantes: EstudianteAcademico[]): number {
    return this.promedioGeneral(this.notasActuales(notas, estudiantes));
  }

  aprobadosActual(notas: Nota[], estudiantes: EstudianteAcademico[]): number {
    return this.aprobados(this.notasActuales(notas, estudiantes));
  }

  totalActual(notas: Nota[], estudiantes: EstudianteAcademico[]): number {
    return this.notasActuales(notas, estudiantes).length;
  }

  guardar(): void {
    // En esta version local los cambios ya quedan en memoria; el mensaje confirma la accion al usuario.
    this.guardado = true;
    setTimeout(() => this.guardado = false, 2500);
  }

  private estudiantesVisibles(estudiantes: EstudianteAcademico[]): EstudianteAcademico[] {
    // Controla la visibilidad de datos segun el rol autenticado.
    const usuario = this.auth.getUsuario();
    if (usuario?.rol === 'estudiante') return estudiantes.filter(e => e.email === usuario.email);
    if (usuario?.rol === 'padre') return estudiantes.filter(e => e.acudienteEmail === usuario.email);
    return estudiantes;
  }
}
