import { Injectable, inject } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Auth, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class FotoService {
  private storage = inject(Storage);
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  async subirFoto(archivo: File): Promise<string> {
    const uid = this.auth.currentUser?.uid;
    const storageRef = ref(this.storage, `fotos/${uid}/perfil.jpg`);
    await uploadBytes(storageRef, archivo);
    const url = await getDownloadURL(storageRef);

    if (this.auth.currentUser) {
      await updateProfile(this.auth.currentUser, { photoURL: url });
      await updateDoc(doc(this.firestore, `usuarios/${uid}`), { photoURL: url });
    }

    return url;
  }

  async getFotoUrl(): Promise<string | null> {
    return this.auth.currentUser?.photoURL || null;
  }
}