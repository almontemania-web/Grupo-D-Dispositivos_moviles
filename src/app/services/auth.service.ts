import { Injectable, inject } from '@angular/core';
import {
  Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, user, signInWithPopup, GoogleAuthProvider,
  FacebookAuthProvider, OAuthProvider, updateProfile
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  get authInstance() { return this.auth; }
  private firestore = inject(Firestore);
  private router = inject(Router);

  user$ = user(this.auth);

  async registro(
    email: string, password: string, nombre: string,
    apellido: string, planSalud: string, noAfiliado: string, fechaNacimiento: string
  ) {
    // Paso 1: crear cuenta en Firebase Auth
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);

    // Paso 2: fijar displayName para que el home muestre nombre completo
    try {
      await updateProfile(cred.user, {
        displayName: apellido ? `${nombre} ${apellido}` : nombre
      });
    } catch (e) { console.warn('updateProfile failed:', e); }

    // Paso 3: guardar datos en Firestore (no bloquea el registro si falla)
    const userData = {
      uid: cred.user.uid,
      nombre, apellido, email,
      planSalud, noAfiliado, fechaNacimiento,
      vigente: true,
      creadoEn: new Date().toISOString()
    };

    try {
      await setDoc(doc(this.firestore, 'usuarios', cred.user.uid), userData);
    } catch (firestoreErr) {
      // Si Firestore falla (p.ej. reglas), guardar localmente para sincronizar después
      localStorage.setItem(`userData_${cred.user.uid}`, JSON.stringify(userData));
      console.warn('Firestore write failed, saved locally:', firestoreErr);
    }

    return cred;
  }

  async login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async loginConGoogle() {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(this.auth, provider);
    try {
      await setDoc(doc(this.firestore, 'usuarios', cred.user.uid), {
        uid: cred.user.uid,
        nombre: cred.user.displayName?.split(' ')[0] || '',
        apellido: cred.user.displayName?.split(' ').slice(1).join(' ') || '',
        email: cred.user.email || '',
        planSalud: '', noAfiliado: '', fechaNacimiento: '',
        vigente: true, creadoEn: new Date().toISOString()
      }, { merge: true });
    } catch (e) { console.warn('Firestore merge failed:', e); }
    return cred;
  }

  async loginConFacebook() {
    const provider = new FacebookAuthProvider();
    const cred = await signInWithPopup(this.auth, provider);
    try {
      await setDoc(doc(this.firestore, 'usuarios', cred.user.uid), {
        uid: cred.user.uid,
        nombre: cred.user.displayName || '',
        apellido: '', email: cred.user.email || '',
        planSalud: '', noAfiliado: '', fechaNacimiento: '',
        vigente: true, creadoEn: new Date().toISOString()
      }, { merge: true });
    } catch (e) { console.warn('Firestore merge failed:', e); }
    return cred;
  }

  async loginConApple() {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    const cred = await signInWithPopup(this.auth, provider);
    try {
      await setDoc(doc(this.firestore, 'usuarios', cred.user.uid), {
        uid: cred.user.uid,
        nombre: cred.user.displayName || '',
        apellido: '', email: cred.user.email || '',
        planSalud: '', noAfiliado: '', fechaNacimiento: '',
        vigente: true, creadoEn: new Date().toISOString()
      }, { merge: true });
    } catch (e) { console.warn('Firestore merge failed:', e); }
    return cred;
  }

  async logout() {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }
}
