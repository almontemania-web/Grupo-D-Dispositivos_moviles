import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, addDoc, deleteDoc, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Medicamento } from '../models/medicamento.model';

export type { Medicamento };

@Injectable({ providedIn: 'root' })
export class MedicamentosService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private get uid(): string {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('Usuario no autenticado');
    return uid;
  }

  private lKey(): string { return `meds_${this.uid}`; }

  private getLocal(): Medicamento[] {
    try {
      const d = localStorage.getItem(this.lKey());
      return d ? JSON.parse(d) : [];
    } catch { return []; }
  }

  private setLocal(items: Medicamento[]): void {
    try { localStorage.setItem(this.lKey(), JSON.stringify(items)); } catch {}
  }

  getMedicamentos(): Observable<Medicamento[]> {
    return new Observable<Medicamento[]>(subscriber => {
      // Emit localStorage immediately so the UI is never empty
      subscriber.next(this.getLocal());

      let unsub: (() => void) | undefined;
      try {
        const ref = collection(this.firestore, `usuarios/${this.uid}/medicamentos`);
        unsub = onSnapshot(
          ref as any,
          (snap: any) => {
            const meds: Medicamento[] = snap.docs.map((d: any) => ({ id: d.id, ...d.data() }));
            this.setLocal(meds);
            subscriber.next(meds);
          },
          (err: any) => {
            // Firestore denied — already emitted localStorage data above
            console.warn('Firestore getMedicamentos error (using localStorage):', err?.code || err);
          }
        );
      } catch (e) {
        console.warn('Firestore init error:', e);
      }

      return () => { if (unsub) unsub(); };
    });
  }

  async agregarMedicamento(med: Medicamento): Promise<void> {
    const newMed: Medicamento = { ...med, creadoEn: new Date().toISOString() };
    const locals = this.getLocal();

    try {
      const ref = collection(this.firestore, `usuarios/${this.uid}/medicamentos`);
      const docRef = await addDoc(ref as any, { ...med, creadoEn: new Date() });
      locals.push({ ...newMed, id: docRef.id });
    } catch (e) {
      const tempId = `local_${Date.now()}`;
      locals.push({ ...newMed, id: tempId });
      console.warn('Saved med to localStorage (Firestore error):', e);
    }
    this.setLocal(locals);
  }

  async eliminarMedicamento(id: string): Promise<void> {
    this.setLocal(this.getLocal().filter(m => m.id !== id));
    if (id.startsWith('local_')) return;
    try {
      await deleteDoc(doc(this.firestore, `usuarios/${this.uid}/medicamentos/${id}`) as any);
    } catch (e) { console.warn('Firestore delete error:', e); }
  }

  async toggleActivo(id: string, activo: boolean): Promise<void> {
    this.setLocal(this.getLocal().map(m => m.id === id ? { ...m, activo } : m));
    if (id.startsWith('local_')) return;
    try {
      await updateDoc(doc(this.firestore, `usuarios/${this.uid}/medicamentos/${id}`) as any, { activo });
    } catch (e) { console.warn('Firestore update error:', e); }
  }
}
