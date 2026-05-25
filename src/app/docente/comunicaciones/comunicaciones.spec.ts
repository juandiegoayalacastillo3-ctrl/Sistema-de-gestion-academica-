// Comentario de pruebas: este archivo valida que el componente o servicio se pueda crear correctamente.
// beforeEach prepara el ambiente antes de cada prueba para que cada test empiece limpio.
// Archivo: .\src\app\docente\comunicaciones\comunicaciones.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComunicadosComponent } from './comunicaciones';

describe('ComunicadosComponent', () => {
  let component: ComunicadosComponent;
  let fixture: ComponentFixture<ComunicadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComunicadosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ComunicadosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
