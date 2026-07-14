import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, query, orderBy, limit } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { RecetaMedRegistro, RecetaRegistro } from '../models/receta.model';

export type { RecetaMedRegistro, RecetaRegistro };

@Injectable({ providedIn: 'root' })
export class RecetasService {
  private firestore = inject(Firestore);
  private auth     = inject(Auth);
  private injector = inject(Injector);

  private get uid(): string {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('Usuario no autenticado');
    return uid;
  }

  getHistorial(): Observable<RecetaRegistro[]> {
    const ref = collection(this.firestore, `usuarios/${this.uid}/recetas`);
    const q   = query(ref, orderBy('fecha', 'desc'), limit(50));
    return collectionData(q, { idField: 'id' }) as Observable<RecetaRegistro[]>;
  }

  async guardarRegistro(registro: RecetaRegistro) {
    return runInInjectionContext(this.injector, () => {
      const ref = collection(this.firestore, `usuarios/${this.uid}/recetas`);
      return addDoc(ref, { ...registro, fecha: new Date() });
    });
  }
}
