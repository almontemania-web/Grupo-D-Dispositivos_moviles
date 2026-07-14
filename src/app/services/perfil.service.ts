import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { PerfilMedico, UsuarioData } from '../models/perfil.model';

export type { PerfilMedico, UsuarioData };

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private firestore = inject(Firestore);
  private auth     = inject(Auth);
  private injector = inject(Injector);

  private get uid(): string {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('Usuario no autenticado');
    return uid;
  }

  async getPerfil(): Promise<PerfilMedico | null> {
    return runInInjectionContext(this.injector, async () => {
      try {
        const ref  = doc(this.firestore, `usuarios/${this.uid}/perfil/medico`);
        const snap = await getDoc(ref);
        return snap.exists() ? snap.data() as PerfilMedico : null;
      } catch (e) {
        console.warn('getPerfil Firestore error:', e);
        return null;
      }
    });
  }

  async guardarPerfil(perfil: PerfilMedico) {
    return runInInjectionContext(this.injector, () => {
      const ref = doc(this.firestore, `usuarios/${this.uid}/perfil/medico`);
      return setDoc(ref, perfil, { merge: true });
    });
  }

  async getUsuario(): Promise<UsuarioData | null> {
    return runInInjectionContext(this.injector, async () => {
      try {
        const ref  = doc(this.firestore, `usuarios/${this.uid}`);
        const snap = await getDoc(ref);
        if (snap.exists()) return snap.data() as UsuarioData;
      } catch (e) {
        console.warn('getUsuario Firestore error, checking localStorage:', e);
      }
      // Fallback: datos guardados localmente si Firestore falló al registrarse
      const local = localStorage.getItem(`userData_${this.uid}`);
      return local ? JSON.parse(local) as UsuarioData : null;
    });
  }

  async guardarUsuario(data: Partial<UsuarioData>) {
    return runInInjectionContext(this.injector, async () => {
      try {
        const ref = doc(this.firestore, `usuarios/${this.uid}`);
        await setDoc(ref, data, { merge: true });
        // Actualizar también el localStorage si existía
        const local = localStorage.getItem(`userData_${this.uid}`);
        if (local) {
          const merged = { ...JSON.parse(local), ...data };
          localStorage.setItem(`userData_${this.uid}`, JSON.stringify(merged));
        }
      } catch (e) {
        console.warn('guardarUsuario Firestore error:', e);
        // Guardar localmente como fallback
        const local = localStorage.getItem(`userData_${this.uid}`);
        const merged = local ? { ...JSON.parse(local), ...data } : data;
        localStorage.setItem(`userData_${this.uid}`, JSON.stringify(merged));
      }
    });
  }
}
