// Comentario de pruebas: este archivo valida que el componente o servicio se pueda crear correctamente.
// beforeEach prepara el ambiente antes de cada prueba para que cada test empiece limpio.
// Archivo: .\src\app\shared\components\base-card\base-card.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseCardComponent } from './base-card';

describe('BaseCardComponent', () => {
  let component: BaseCardComponent;
  let fixture: ComponentFixture<BaseCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaseCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
