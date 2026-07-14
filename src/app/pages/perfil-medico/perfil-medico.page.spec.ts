import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilMedicoPage } from './perfil-medico.page';

describe('PerfilMedicoPage', () => {
  let component: PerfilMedicoPage;
  let fixture: ComponentFixture<PerfilMedicoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilMedicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
