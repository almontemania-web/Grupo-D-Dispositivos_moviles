import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CarneDigitalPage } from './carne-digital.page';

describe('CarneDigitalPage', () => {
  let component: CarneDigitalPage;
  let fixture: ComponentFixture<CarneDigitalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CarneDigitalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
