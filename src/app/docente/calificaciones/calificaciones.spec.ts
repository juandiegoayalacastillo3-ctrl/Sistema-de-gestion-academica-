// Comentario de pruebas: este archivo valida que el componente o servicio se pueda crear correctamente.
// beforeEach prepara el ambiente antes de cada prueba para que cada test empiece limpio.
// Archivo: .\src\app\docente\calificaciones\calificaciones.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalificacionesComponent } from './calificaciones';

describe('CalificacionesComponent', () => {
  let component: CalificacionesComponent;
  let fixture: ComponentFixture<CalificacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalificacionesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CalificacionesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
