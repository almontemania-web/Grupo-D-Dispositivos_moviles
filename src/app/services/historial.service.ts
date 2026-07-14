import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { HistorialItem } from '../models/historial.model';

export type { HistorialItem };

@Injectable({ providedIn: 'root' })
export class HistorialService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private get uid(): string {
    return this.auth.currentUser?.uid || '';
  }

  getHistorial(): Observable<HistorialItem[]> {
    return new Observable<HistorialItem[]>(subscriber => {
      subscriber.next(this.buildHistorial());
      return () => {};
    });
  }

  // Call this to refresh (e.g. after marking a dose)
  refreshHistorial(): HistorialItem[] {
    return this.buildHistorial();
  }

  private buildHistorial(): HistorialItem[] {
    const uid = this.uid;
    if (!uid) return [];

    const items: HistorialItem[] = [];

    // ── Medicamentos registrados ─────────────────────────────
    try {
      const raw = localStorage.getItem(`meds_${uid}`);
      if (raw) {
        (JSON.parse(raw) as any[]).forEach(m => {
          items.push({
            id: `med_${m.id || m.nombre}`,
            tipo: 'medicamento',
            titulo: m.nombre,
            descripcion: `${m.dosis} · ${this.labelFrec(m.frecuencia)} · ${m.activo ? 'Activo' : 'Inactivo'}`,
            fecha: this.toISO(m.creadoEn) || new Date().toISOString()
          });
        });
      }
    } catch (e) { console.warn('historial meds parse error', e); }

    // ── Citas médicas ────────────────────────────────────────
    try {
      const raw = localStorage.getItem(`citas_${uid}`);
      if (raw) {
        (JSON.parse(raw) as any[]).forEach(c => {
          items.push({
            id: `cita_${c.id || c.doctor}`,
            tipo: 'cita',
            titulo: `Dr. ${c.doctor}`,
            descripcion: [
              c.fecha ? this.formatFecha(c.fecha) : '',
              c.hora || '',
              c.especialidad || '',
              c.lugar || ''
            ].filter(Boolean).join(' · '),
            fecha: c.fecha ? c.fecha + 'T12:00:00' : (this.toISO(c.creadoEn) || new Date().toISOString())
          });
        });
      }
    } catch (e) { console.warn('historial citas parse error', e); }

    // ── Tomas (marcar tomado) ────────────────────────────────
    try {
      const raw = localStorage.getItem(`tomas_${uid}`);
      if (raw) {
        (JSON.parse(raw) as any[]).forEach(t => {
          items.push({
            id: `toma_${t.id}`,
            tipo: 'toma',
            titulo: t.medicamentoNombre,
            descripcion: `${t.dosis} · ${t.hora || ''}`,
            fecha: t.fecha || new Date().toISOString(),
            tomado: t.tomado
          });
        });
      }
    } catch (e) { console.warn('historial tomas parse error', e); }

    return items.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  async registrarToma(registro: { medicamentoNombre: string; dosis: string; hora: string; tomado: boolean; tipo: string }) {
    const uid = this.uid;
    if (!uid) return;

    const toma = { id: Date.now().toString(), ...registro, fecha: new Date().toISOString() };

    // Guardar en localStorage
    try {
      const raw = localStorage.getItem(`tomas_${uid}`);
      const arr: any[] = raw ? JSON.parse(raw) : [];
      arr.unshift(toma);
      if (arr.length > 200) arr.splice(200);
      localStorage.setItem(`tomas_${uid}`, JSON.stringify(arr));
    } catch (e) { console.warn('tomas localStorage error', e); }

    // Intentar Firestore
    try {
      const ref = collection(this.firestore, `usuarios/${uid}/historial`);
      await addDoc(ref as any, { ...registro, fecha: new Date() });
    } catch (e) { console.warn('Historial Firestore write failed:', e); }
  }

  private toISO(val: any): string | null {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (val.seconds) return new Date(val.seconds * 1000).toISOString();
    if (val instanceof Date) return val.toISOString();
    return null;
  }

  private labelFrec(f: string): string {
    return ({ '8h': 'Cada 8h', '12h': 'Cada 12h', '24h': '1 vez/día', 'semanal': 'Semanal' } as any)[f] || f;
  }

  private formatFecha(f: string): string {
    try {
      return new Date(f + 'T12:00:00').toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return f; }
  }
}
