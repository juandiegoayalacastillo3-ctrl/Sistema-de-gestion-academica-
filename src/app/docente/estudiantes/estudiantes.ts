// Comentario general: este archivo hace parte del sistema academico. Se comenta para que sea facil explicar su responsabilidad en la sustentacion.
// Archivo: .\src\app\docente\estudiantes\estudiantes.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { AuthService } from '../../core/services/auth';
import { AcademicoService, Curso, EstudianteAcademico } from '../../core/services/academico';

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './estudiantes.html',
  styleUrl: './estudiantes.css'
})
export class EstudiantesComponent {
  // Servicios usados para saber el rol y modificar datos academicos.
  public auth = inject(AuthService);
  public academico = inject(AcademicoService);

  busqueda = '';
  cursoFiltro: Curso | 'Todos' = 'Todos';
  mostrarModal = false;
  estudianteSeleccionado: EstudianteAcademico | null = null;
  guardado = '';
  error = '';
  // Modelo temporal del formulario para agregar un estudiante.
  nuevo = {
    nombre: '',
    curso: '9A' as Curso,
    email: '',
    acudiente: '',
    acudienteEmail: '',
  };

  estudiantes$ = this.academico.estudiantes$.pipe(
    // Solo directivo y docente pueden ver esta pantalla con datos.
    map(estudiantes => this.auth.getRol() === 'directivo' || this.auth.getRol() === 'docente' ? estudiantes : [])
  );

  filtrar(estudiantes: EstudianteAcademico[]): EstudianteAcademico[] {
    // Filtro combinado por texto y curso.
    const q = this.busqueda.toLowerCase().trim();
    return estudiantes.filter(e => {
      const coincideTexto = !q || e.nombre.toLowerCase().includes(q) || e.curso.toLowerCase().includes(q) || e.acudiente.toLowerCase().includes(q);
      const coincideCurso = this.cursoFiltro === 'Todos' || e.curso === this.cursoFiltro;
      return coincideTexto && coincideCurso;
    });
  }

  mover(e: EstudianteAcademico, curso: string): void {
    // Accion del directivo para cambiar un estudiante de curso.
    this.academico.moverEstudiante(e.id, curso as Curso);
  }

  eliminar(e: EstudianteAcademico): void {
    // Confirmacion para evitar borrar accidentalmente.
    if (confirm(`Eliminar a ${e.nombre} del sistema?`)) {
      this.academico.eliminarEstudiante(e.id);
    }
  }

  agregar(): void {
    // Limpia mensajes anteriores.
    this.error = '';
    this.guardado = '';

    if (!this.nuevo.nombre || !this.nuevo.email || !this.nuevo.acudiente || !this.nuevo.acudienteEmail) {
      this.error = 'Completa todos los datos del estudiante y acudiente.';
      return;
    }

    // Primero se crea el estudiante dentro del servicio academico.
    const estudiante = this.academico.agregarEstudiante({
      nombre: this.nuevo.nombre.trim(),
      curso: this.nuevo.curso,
      email: this.nuevo.email.trim().toLowerCase(),
      acudiente: this.nuevo.acudiente.trim(),
      acudienteEmail: this.nuevo.acudienteEmail.trim().toLowerCase(),
    });

    // Luego se crea un login local para el estudiante nuevo.
    this.auth.register({
      nombre: estudiante.nombre,
      email: estudiante.email,
      password: '123456',
      rol: 'estudiante',
    }).subscribe({ error: () => undefined });

    // Tambien se crea un login local para el acudiente.
    this.auth.register({
      nombre: estudiante.acudiente,
      email: estudiante.acudienteEmail,
      password: '123456',
      rol: 'padre',
    }).subscribe({ error: () => undefined });

    this.guardado = `Estudiante agregado. Login estudiante: ${estudiante.email} / 123456. Login acudiente: ${estudiante.acudienteEmail} / 123456.`;
    this.nuevo = { nombre: '', curso: '9A', email: '', acudiente: '', acudienteEmail: '' };
  }

  verDetalle(e: EstudianteAcademico): void {
    // Abre el modal de detalle.
    this.estudianteSeleccionado = e;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  promedio(e: EstudianteAcademico): number {
    return this.academico.promedioEstudiante(e.id);
  }

  estado(e: EstudianteAcademico): string {
    return this.academico.estadoPromedio(this.promedio(e));
  }

  getEstadoClass(estado: string): string {
    if (estado === 'Aprobado') return 'badge-aprobado';
    if (estado === 'Reprobado') return 'badge-reprobado';
    return 'badge-pendiente';
  }
}
