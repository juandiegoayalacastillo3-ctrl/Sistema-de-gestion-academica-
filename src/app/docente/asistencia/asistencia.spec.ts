// Comentario de pruebas: este archivo valida que el componente o servicio se pueda crear correctamente.
// beforeEach prepara el ambiente antes de cada prueba para que cada test empiece limpio.
// Archivo: .\src\app\docente\asistencia\asistencia.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsistenciaComponent } from './asistencia';

describe('AsistenciaComponent', () => {
  let component: AsistenciaComponent;
  let fixture: ComponentFixture<AsistenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsistenciaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AsistenciaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
