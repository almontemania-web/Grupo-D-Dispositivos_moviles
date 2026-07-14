import { Injectable } from '@angular/core';

const STORAGE_KEY = 'modoAdultoMayor';

@Injectable({ providedIn: 'root' })
export class SeniorModeService {
  private _activo = localStorage.getItem(STORAGE_KEY) === 'true';

  constructor() {
    this.aplicarClase();
  }

  get activo(): boolean {
    return this._activo;
  }

  toggle(): boolean {
    this._activo = !this._activo;
    localStorage.setItem(STORAGE_KEY, String(this._activo));
    this.aplicarClase();
    return this._activo;
  }

  private aplicarClase() {
    document.body.classList.toggle('senior-mode', this._activo);
  }
}
