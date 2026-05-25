// Comentario general: este archivo hace parte del sistema academico. Se comenta para que sea facil explicar su responsabilidad en la sustentacion.
// Archivo: .\src\app\core\services\academico.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Api } from './api';
import { SupabaseService } from './supabase';

export type Curso = '9A' | '9B' | '9C' | '10A';
export type Materia = 'Matematicas' | 'Espanol' | 'Ciencias' | 'Historia' | 'Ingles';
export type Periodo = '1' | '2' | '3' | '4';
export type TipoComunicado = 'info' | 'alerta' | 'urgente';

export interface EstudianteAcademico {
  // Modelo central del estudiante. Aqui tambien se guarda el acudiente vinculado.
  id: number;
  nombre: string;
  curso: Curso;
  email: string;
  acudiente: string;
  acudienteEmail: string;
  presente: boolean;
  justificado: boolean;
}

export interface Nota {
  // Cada nota pertenece a un estudiante, una materia y un periodo.
  estudianteId: number;
  materia: Materia;
  periodo: Periodo;
  nota1: number;
  nota2: number;
  nota3: number;
  ultimaModificacion: number; // timestamp para ordenar por mas reciente en el dashboard.
}

export interface Comunicado {
  id: number;
  titulo: string;
  mensaje: string;
  destinatario: string;
  fecha: string;
  tipo: TipoComunicado;
  autor: string;
}

const estudiantesIniciales: EstudianteAcademico[] = [
  { id: 1, nombre: 'Valentina Ospina', curso: '9A', email: 'v.ospina@sge.com', acudiente: 'Maria Ospina', acudienteEmail: 'padre@sge.com', presente: true, justificado: false },
  { id: 2, nombre: 'Sebastian Mora', curso: '9A', email: 's.mora@sge.com', acudiente: 'Carlos Mora', acudienteEmail: 'c.mora@sge.com', presente: false, justificado: false },
  { id: 3, nombre: 'Luisa Fernandez', curso: '9B', email: 'l.fernandez@sge.com', acudiente: 'Pedro Fernandez', acudienteEmail: 'p.fernandez@sge.com', presente: true, justificado: false },
  { id: 4, nombre: 'Diego Salcedo', curso: '9B', email: 'd.salcedo@sge.com', acudiente: 'Ana Salcedo', acudienteEmail: 'a.salcedo@sge.com', presente: true, justificado: false },
  { id: 5, nombre: 'Mariana Rios', curso: '9A', email: 'estudiante@sge.com', acudiente: 'Jorge Rios', acudienteEmail: 'j.rios@sge.com', presente: false, justificado: true },
  { id: 6, nombre: 'Andres Gomez', curso: '9C', email: 'a.gomez@sge.com', acudiente: 'Laura Gomez', acudienteEmail: 'l.gomez@sge.com', presente: true, justificado: false },
  { id: 7, nombre: 'Camila Herrera', curso: '9C', email: 'c.herrera@sge.com', acudiente: 'Rosa Herrera', acudienteEmail: 'r.herrera@sge.com', presente: true, justificado: false },
  { id: 8, nombre: 'Juan Pablo Torres', curso: '10A', email: 'jp.torres@sge.com', acudiente: 'Luis Torres', acudienteEmail: 'l.torres@sge.com', presente: false, justificado: false },
];

const materias: Materia[] = ['Matematicas', 'Espanol', 'Ciencias', 'Historia', 'Ingles'];
const cursos: Curso[] = ['9A', '9B', '9C', '10A'];

@Injectable({ providedIn: 'root' })
export class AcademicoService {
  // Listas que se usan en selects de formularios para evitar escribir opciones repetidas.
  readonly cursos = cursos;
  readonly materias = materias;

  // BehaviorSubject guarda el valor actual y avisa a las pantallas cuando cambia.
  private estudiantesSubject = new BehaviorSubject<EstudianteAcademico[]>(estudiantesIniciales);
  private notasSubject = new BehaviorSubject<Nota[]>(this.crearNotasIniciales());
  private comunicadosSubject = new BehaviorSubject<Comunicado[]>([
    { id: 1, titulo: 'Entrega de boletines', mensaje: 'Los boletines del periodo actual ya estan disponibles para consulta.', destinatario: 'Todos los padres', fecha: '2026-05-18', tipo: 'info', autor: 'Coordinacion' },
    { id: 2, titulo: 'Alerta academica', mensaje: 'Algunos estudiantes requieren plan de mejora esta semana.', destinatario: 'Grado 9A', fecha: '2026-05-17', tipo: 'alerta', autor: 'Docente' },
    { id: 3, titulo: 'Reunion general', mensaje: 'Reunion virtual de acudientes el viernes a las 6:00 PM.', destinatario: 'Todos los padres', fecha: '2026-05-16', tipo: 'urgente', autor: 'Directivo' },
  ]);

  // Se exponen como Observable para que los componentes lean datos sin modificar directamente los arreglos.
  estudiantes$ = this.estudiantesSubject.asObservable();
  notas$ = this.notasSubject.asObservable();
  comunicados$ = this.comunicadosSubject.asObservable();

  constructor(private api: Api, private supabase: SupabaseService) {
    if (environment.useSupabase) {
      this.cargarDatosSupabase();
    } else if (!environment.useMockAuth) {
      this.cargarDatosRemotos();
    }
  }

  moverEstudiante(id: number, curso: Curso): void {
    // map crea un nuevo arreglo y solo cambia el curso del estudiante encontrado.
    this.estudiantesSubject.next(this.estudiantesSubject.value.map(e => e.id === id ? { ...e, curso } : e));
    if (environment.useSupabase) {
      void this.supabase.client.from('estudiantes').update({ curso }).eq('id', id);
    } else if (!environment.useMockAuth) {
      this.api.patch('academic/estudiantes/' + id + '/curso', { curso }).subscribe({ error: () => undefined });
    }
  }

  agregarEstudiante(data: Omit<EstudianteAcademico, 'id' | 'presente' | 'justificado'>): EstudianteAcademico {
    // Cuando el directivo agrega un estudiante, se le asigna id y asistencia inicial.
    const nuevo: EstudianteAcademico = {
      ...data,
      id: this.siguienteId(),
      presente: true,
      justificado: false,
    };

    // next actualiza el estado y notifica automaticamente a las pantallas suscritas.
    this.estudiantesSubject.next([...this.estudiantesSubject.value, nuevo]);
    // Tambien se crean notas en cero para que aparezca en calificaciones.
    this.notasSubject.next([...this.notasSubject.value, ...this.crearNotasParaEstudiante(nuevo)]);
    if (environment.useSupabase) {
      this.agregarEstudianteSupabase(nuevo);
    } else if (!environment.useMockAuth) {
      this.api.post<EstudianteAcademico>('academic/estudiantes', nuevo).subscribe({
        next: estudianteGuardado => {
          this.estudiantesSubject.next(this.estudiantesSubject.value.map(e => e.id === nuevo.id ? estudianteGuardado : e));
          this.notasSubject.next([
            ...this.notasSubject.value.filter(n => n.estudianteId !== nuevo.id),
            ...this.crearNotasParaEstudiante(estudianteGuardado),
          ]);
        },
        error: () => undefined,
      });
    }
    return nuevo;
  }

  eliminarEstudiante(id: number): void {
    // Se elimina al estudiante y tambien sus notas para no dejar datos huerfanos.
    this.estudiantesSubject.next(this.estudiantesSubject.value.filter(e => e.id !== id));
    this.notasSubject.next(this.notasSubject.value.filter(n => n.estudianteId !== id));
    if (environment.useSupabase) {
      void this.supabase.client.from('estudiantes').delete().eq('id', id);
    } else if (!environment.useMockAuth) {
      this.api.delete('academic/estudiantes/' + id).subscribe({ error: () => undefined });
    }
  }

  actualizarNota(estudianteId: number, materia: Materia, periodo: Periodo, campo: 'nota1' | 'nota2' | 'nota3', valor: number): void {
    // Limita la nota entre 0 y 5, que es la escala academica usada en el sistema.
    const nota = Math.max(0, Math.min(5, Number(valor) || 0));
    this.notasSubject.next(this.notasSubject.value.map(n =>
      n.estudianteId === estudianteId && n.materia === materia && n.periodo === periodo
        ? { ...n, [campo]: nota, ultimaModificacion: Date.now() }
        : n
    ));
    if (environment.useSupabase) {
      void this.supabase.client
        .from('notas')
        .update({ [campo]: nota, ultima_modificacion: Date.now() })
        .eq('estudiante_id', estudianteId)
        .eq('materia', materia)
        .eq('periodo', periodo);
    } else if (!environment.useMockAuth) {
      this.api.patch('academic/notas', { estudianteId, materia, periodo, campo, valor: nota }).subscribe({ error: () => undefined });
    }
  }

  setAsistencia(id: number, presente: boolean): void {
    // Cambia el estado de asistencia de un estudiante especifico.
    this.estudiantesSubject.next(this.estudiantesSubject.value.map(e => e.id === id ? { ...e, presente } : e));
    this.guardarAsistencia(id);
  }

  setJustificado(id: number, justificado: boolean): void {
    // Cambia el estado de justificacion de un estudiante ausente.
    this.estudiantesSubject.next(this.estudiantesSubject.value.map(e => e.id === id ? { ...e, justificado } : e));
    this.guardarAsistencia(id);
  }

  enviarComunicado(comunicado: Omit<Comunicado, 'id' | 'fecha'>): void {
    // El comunicado nuevo se inserta al inicio para que se vea primero.
    const nuevo: Comunicado = {
      ...comunicado,
      id: Date.now(),
      fecha: new Date().toISOString().split('T')[0],
    };
    this.comunicadosSubject.next([nuevo, ...this.comunicadosSubject.value]);
    if (environment.useSupabase) {
      void this.supabase.client.from('comunicados').insert(this.comunicadoToRow(nuevo));
    } else if (!environment.useMockAuth) {
      this.api.post<Comunicado>('academic/comunicados', nuevo).subscribe({
        next: comunicadoGuardado => {
          this.comunicadosSubject.next(this.comunicadosSubject.value.map(c => c.id === nuevo.id ? comunicadoGuardado : c));
        },
        error: () => undefined,
      });
    }
  }

  promedioEstudiante(id: number): number {
    // Calcula el promedio general de todas las notas de un estudiante.
    const notas = this.notasSubject.value.filter(n => n.estudianteId === id);
    if (!notas.length) return 0;
    const total = notas.reduce((sum, n) => sum + this.promedioNota(n), 0);
    return +(total / notas.length).toFixed(1);
  }

  promedioNota(nota: Nota): number {
    // Promedio simple de las tres notas registradas en una materia.
    return +((nota.nota1 + nota.nota2 + nota.nota3) / 3).toFixed(1);
  }

  estadoPromedio(promedio: number): 'Aprobado' | 'Reprobado' | 'Pendiente' {
    // Regla de negocio: 3.0 o mas aprueba; menos de 3.0 reprueba.
    if (!promedio) return 'Pendiente';
    return promedio >= 3 ? 'Aprobado' : 'Reprobado';
  }

  notasPorEstudiante$(estudianteId: number) {
    return this.notas$.pipe(map(notas => notas.filter(n => n.estudianteId === estudianteId)));
  }

  private cargarDatosRemotos(): void {
    this.api.get<EstudianteAcademico[]>('academic/estudiantes').subscribe({
      next: estudiantes => this.estudiantesSubject.next(estudiantes.map(e => ({
        ...e,
        presente: Boolean(e.presente),
        justificado: Boolean(e.justificado),
      }))),
      error: () => undefined,
    });

    this.api.get<Nota[]>('academic/notas').subscribe({
      next: notas => this.notasSubject.next(notas),
      error: () => undefined,
    });

    this.api.get<Comunicado[]>('academic/comunicados').subscribe({
      next: comunicados => this.comunicadosSubject.next(comunicados),
      error: () => undefined,
    });
  }

  private async cargarDatosSupabase(): Promise<void> {
    const { data: estudiantes } = await this.supabase.client
      .from('estudiantes')
      .select('id, nombre, curso, email, acudiente, acudiente_email, presente, justificado')
      .order('nombre');

    if (estudiantes) {
      this.estudiantesSubject.next(estudiantes.map(row => this.estudianteFromRow(row)));
    }

    const { data: notas } = await this.supabase.client
      .from('notas')
      .select('estudiante_id, materia, periodo, nota1, nota2, nota3, ultima_modificacion');

    if (notas) {
      this.notasSubject.next(notas.map(row => this.notaFromRow(row)));
    }

    const { data: comunicados } = await this.supabase.client
      .from('comunicados')
      .select('id, titulo, mensaje, destinatario, fecha, tipo, autor')
      .order('fecha', { ascending: false })
      .order('id', { ascending: false });

    if (comunicados) {
      this.comunicadosSubject.next(comunicados as Comunicado[]);
    }
  }

  private async agregarEstudianteSupabase(nuevo: EstudianteAcademico): Promise<void> {
    const { data: estudianteGuardado } = await this.supabase.client
      .from('estudiantes')
      .insert(this.estudianteToRow(nuevo))
      .select('id, nombre, curso, email, acudiente, acudiente_email, presente, justificado')
      .single();

    if (!estudianteGuardado) return;

    const estudiante = this.estudianteFromRow(estudianteGuardado);
    this.estudiantesSubject.next(this.estudiantesSubject.value.map(e => e.id === nuevo.id ? estudiante : e));
    const notas = this.crearNotasParaEstudiante(estudiante);
    this.notasSubject.next([
      ...this.notasSubject.value.filter(n => n.estudianteId !== nuevo.id),
      ...notas,
    ]);

    await this.supabase.client.from('notas').insert(notas.map(nota => this.notaToRow(nota)));
  }

  private guardarAsistencia(id: number): void {
    if (environment.useMockAuth) return;
    const estudiante = this.estudiantesSubject.value.find(e => e.id === id);
    if (!estudiante) return;

    if (environment.useSupabase) {
      void this.supabase.client.from('estudiantes').update({
        presente: estudiante.presente,
        justificado: estudiante.justificado,
      }).eq('id', id);
      return;
    }

    this.api.patch('academic/estudiantes/' + id + '/asistencia', {
      presente: estudiante.presente,
      justificado: estudiante.justificado,
    }).subscribe({ error: () => undefined });
  }

  private estudianteFromRow(row: any): EstudianteAcademico {
    return {
      id: row.id,
      nombre: row.nombre,
      curso: row.curso,
      email: row.email,
      acudiente: row.acudiente,
      acudienteEmail: row.acudiente_email,
      presente: Boolean(row.presente),
      justificado: Boolean(row.justificado),
    };
  }

  private estudianteToRow(estudiante: EstudianteAcademico) {
    return {
      nombre: estudiante.nombre,
      curso: estudiante.curso,
      email: estudiante.email,
      acudiente: estudiante.acudiente,
      acudiente_email: estudiante.acudienteEmail,
      presente: estudiante.presente,
      justificado: estudiante.justificado,
    };
  }

  private notaFromRow(row: any): Nota {
    return {
      estudianteId: row.estudiante_id,
      materia: row.materia,
      periodo: row.periodo,
      nota1: Number(row.nota1),
      nota2: Number(row.nota2),
      nota3: Number(row.nota3),
      ultimaModificacion: Number(row.ultima_modificacion),
    };
  }

  private notaToRow(nota: Nota) {
    return {
      estudiante_id: nota.estudianteId,
      materia: nota.materia,
      periodo: nota.periodo,
      nota1: nota.nota1,
      nota2: nota.nota2,
      nota3: nota.nota3,
      ultima_modificacion: nota.ultimaModificacion,
    };
  }

  private comunicadoToRow(comunicado: Comunicado) {
    return {
      titulo: comunicado.titulo,
      mensaje: comunicado.mensaje,
      destinatario: comunicado.destinatario,
      fecha: comunicado.fecha,
      tipo: comunicado.tipo,
      autor: comunicado.autor,
    };
  }

  private crearNotasIniciales(): Nota[] {
    // Genera notas demo para todos los estudiantes iniciales.
    return estudiantesIniciales.flatMap((estudiante, idx) =>
      materias.flatMap((materia, materiaIndex) =>
        (['1', '2'] as Periodo[]).map(periodo => {
          const base = 2.8 + ((idx + materiaIndex + Number(periodo)) % 5) * 0.35;
          return {
            estudianteId: estudiante.id,
            materia,
            periodo,
            nota1: +Math.min(5, base).toFixed(1),
            nota2: +Math.min(5, base + 0.3).toFixed(1),
            nota3: +Math.min(5, base + 0.1).toFixed(1),
            ultimaModificacion: 0,
          };
        })
      )
    );
  }

  private crearNotasParaEstudiante(estudiante: EstudianteAcademico): Nota[] {
    // Cuando se agrega un estudiante nuevo, se le crean registros vacios para cada materia y periodo.
    return materias.flatMap(materia =>
      (['1', '2', '3', '4'] as Periodo[]).map(periodo => ({
        estudianteId: estudiante.id,
        materia,
        periodo,
        nota1: 0,
        nota2: 0,
        nota3: 0,
        ultimaModificacion: 0,
      }))
    );
  }

  private siguienteId(): number {
    return Math.max(0, ...this.estudiantesSubject.value.map(e => e.id)) + 1;
  }
}
