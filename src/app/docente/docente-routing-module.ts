// Comentario general: este archivo hace parte del sistema academico. Se comenta para que sea facil explicar su responsabilidad en la sustentacion.
// Archivo: .\src\app\docente\docente-routing-module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent }    from './dashboard/dashboard';
import { AsistenciaComponent }   from './asistencia/asistencia';
import { CalificacionesComponent } from './calificaciones/calificaciones';
import { EstudiantesComponent }  from './estudiantes/estudiantes';
import { ComunicadosComponent }  from './comunicaciones/comunicaciones';
import { DocenteShellComponent } from './docente-shell';

const routes: Routes = [
  {
    path: '',
    component: DocenteShellComponent,
    children: [
      { path: '',               redirectTo: 'dashboard', pathMatch: 'full' as const },
      { path: 'dashboard',      component: DashboardComponent },
      { path: 'asistencia',     component: AsistenciaComponent },
      { path: 'calificaciones', component: CalificacionesComponent },
      { path: 'estudiantes',    component: EstudiantesComponent },
      { path: 'comunicados',    component: ComunicadosComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocenteRoutingModule {}
