// Comentario general: este archivo hace parte del sistema academico. Se comenta para que sea facil explicar su responsabilidad en la sustentacion.
// Archivo: .\src\app\shared\components\base-card\base-card.ts

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-base-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-card.html',
  styleUrl: './base-card.css'
})
export class BaseCardComponent implements OnInit {
  @Input() titulo: string = 'Tarjeta';
  cargando: boolean = false;
  ultimaActualizacion: string = '';

  ngOnInit(): void {
    // Esta lógica la heredan TODAS las tarjetas hijas
    this.ultimaActualizacion = new Date().toLocaleString('es-CO');
    this.cargarDatos();
  }

  protected cargarDatos(): void {
    setTimeout(() => { this.cargando = false; }, 600);
  }
}
