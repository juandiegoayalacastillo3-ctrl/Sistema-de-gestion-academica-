// Comentario general: este archivo hace parte del sistema academico. Se comenta para que sea facil explicar su responsabilidad en la sustentacion.
// Archivo: .\src\main.ts

import 'zone.js';  // ← agregar esto primero
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));