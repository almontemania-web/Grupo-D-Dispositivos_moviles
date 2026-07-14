import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EscanearRecetaPage } from './escanear-receta.page';

describe('EscanearRecetaPage', () => {
  let component: EscanearRecetaPage;
  let fixture: ComponentFixture<EscanearRecetaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EscanearRecetaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
