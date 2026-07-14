import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { NetworkService } from './network.service';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { ToastController } from '@ionic/angular/standalone';

interface PendingOperation {
  id: string;
  coleccion: string;
  datos: any;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class OfflineService {
  private networkService = inject(NetworkService);
  private firestore  = inject(Firestore);
  private auth       = inject(Auth);
  private toastCtrl  = inject(ToastController);
  private injector   = inject(Injector);

  private STORAGE_KEY = 'medicalert_pending_ops';

  getPendingOps(): PendingOperation[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private savePendingOps(ops: PendingOperation[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(ops));
  }

  async guardarDato(coleccion: string, datos: any): Promise<boolean> {
    if (this.networkService.isOnline) {
      try {
        await runInInjectionContext(this.injector, () => {
          const uid = this.auth.currentUser?.uid;
          const ref = collection(this.firestore, `usuarios/${uid}/${coleccion}`);
          return addDoc(ref, { ...datos, creadoEn: new Date() });
        });
        return true;
      } catch (e) {
        console.error('Firestore error en guardarDato, guardando localmente:', e);
        await this.guardarLocalmente(coleccion, datos);
        return false;
      }
    } else {
      await this.guardarLocalmente(coleccion, datos);
      return false;
    }
  }

  private async guardarLocalmente(coleccion: string, datos: any) {
    const ops = this.getPendingOps();
    const nueva: PendingOperation = {
      id: Date.now().toString(),
      coleccion,
      datos: { ...datos, creadoEn: new Date().toISOString() },
      timestamp: Date.now()
    };
    ops.push(nueva);
    this.savePendingOps(ops);

    const toast = await this.toastCtrl.create({
      message: 'Guardado localmente. Se sincronizará cuando tengas conexión.',
      duration: 3500,
      color: 'warning',
      position: 'bottom'
    });
    await toast.present();
  }

  async sincronizarPendientes(): Promise<number> {
    if (!this.networkService.isOnline) return 0;

    const ops = this.getPendingOps();
    if (ops.length === 0) return 0;

    let sincronizados = 0;
    const fallidos: PendingOperation[] = [];

    for (const op of ops) {
      try {
        await runInInjectionContext(this.injector, () => {
          const uid = this.auth.currentUser?.uid;
          const ref = collection(this.firestore, `usuarios/${uid}/${op.coleccion}`);
          return addDoc(ref, op.datos);
        });
        sincronizados++;
      } catch (e) {
        fallidos.push(op);
      }
    }

    this.savePendingOps(fallidos);

    if (sincronizados > 0) {
      const toast = await this.toastCtrl.create({
        message: `${sincronizados} dato(s) sincronizado(s) con el servidor`,
        duration: 3000, color: 'success', position: 'bottom'
      });
      await toast.present();
    }

    return sincronizados;
  }

  getPendingCount(): number {
    return this.getPendingOps().length;
  }
}
