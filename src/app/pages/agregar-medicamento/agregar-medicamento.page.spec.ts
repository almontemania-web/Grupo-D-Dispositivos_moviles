import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarMedicamentoPage } from './agregar-medicamento.page';

describe('AgregarMedicamentoPage', () => {
  let component: AgregarMedicamentoPage;
  let fixture: ComponentFixture<AgregarMedicamentoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarMedicamentoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
