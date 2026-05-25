// Comentario de pruebas: este archivo valida que el componente o servicio se pueda crear correctamente.
// beforeEach prepara el ambiente antes de cada prueba para que cada test empiece limpio.
// Archivo: .\src\app\shared\components\footer\footer.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
