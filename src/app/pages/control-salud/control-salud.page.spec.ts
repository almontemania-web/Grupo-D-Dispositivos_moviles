import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlSaludPage } from './control-salud.page';

describe('ControlSaludPage', () => {
  let component: ControlSaludPage;
  let fixture: ComponentFixture<ControlSaludPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlSaludPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
