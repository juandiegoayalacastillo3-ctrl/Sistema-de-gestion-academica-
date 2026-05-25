// Comentario general: este archivo hace parte del sistema academico. Se comenta para que sea facil explicar su responsabilidad en la sustentacion.
// Archivo: .\src\app\docente\docente-module.ts

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocenteRoutingModule } from './docente-routing-module';

@NgModule({
  imports: [CommonModule, DocenteRoutingModule]
})
export class DocenteModule {}
