import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { MedicamentoInfo } from '../models/medicamento-info.model';

export interface QrEscaneo {
  id: string;
  codigoQr: string;
  fecha: string;
  info: MedicamentoInfo | null;
}

const STORAGE_KEY = 'qr_historial';

@Injectable({ providedIn: 'root' })
export class QrHistorialService {
  private storage: Storage | null = null;
  private ready = this.init();

  private async init(): Promise<Storage> {
    const storage = new Storage();
    this.storage = await storage.create();
    return this.storage;
  }

  async guardarEscaneo(codigoQr: string, info: MedicamentoInfo | null): Promise<QrEscaneo> {
    const storage = await this.ready;
    const registro: QrEscaneo = {
      id: Date.now().toString(),
      codigoQr,
      fecha: new Date().toISOString(),
      info
    };

    const lista = await this.obtenerHistorial();
    lista.unshift(registro);
    if (lista.length > 50) lista.splice(50);
    await storage.set(STORAGE_KEY, lista);
    return registro;
  }

  async obtenerHistorial(): Promise<QrEscaneo[]> {
    const storage = await this.ready;
    const data = await storage.get(STORAGE_KEY);
    return data || [];
  }

  async limpiarHistorial(): Promise<void> {
    const storage = await this.ready;
    await storage.set(STORAGE_KEY, []);
  }
}
