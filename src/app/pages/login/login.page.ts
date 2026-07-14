import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  IonContent, IonButton, IonInput, IonItem,
  IonSpinner, IonIcon, AlertController, LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heartOutline, eyeOutline, eyeOffOutline, logInOutline, personAddOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonButton,
    IonInput, IonItem, IonSpinner, IonIcon]
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private loadingCtrl = inject(LoadingController);

  email = '';
  password = '';
  mostrarPassword = false;
  cargando = false;

  constructor() {
    addIcons({ heartOutline, eyeOutline, eyeOffOutline, logInOutline, personAddOutline });
  }

  async ingresar() {
    if (!this.email || !this.password) {
      this.mostrarError('Por favor completa todos los campos');
      return;
    }
    const loading = await this.loadingCtrl.create({ message: 'Ingresando...' });
    await loading.present();
    try {
      await this.auth.login(this.email, this.password);
      await loading.dismiss();
      this.router.navigate(['/home'], { replaceUrl: true });
    } catch (e: any) {
      await loading.dismiss();
      this.mostrarError(this.traducirError(e.code));
    }
  }

  async loginConGoogle() {
    const loading = await this.loadingCtrl.create({ message: 'Conectando con Google...' });
    await loading.present();
    try {
      await this.auth.loginConGoogle();
      await loading.dismiss();
      this.router.navigate(['/home'], { replaceUrl: true });
    } catch (e: any) {
      await loading.dismiss();
      if (e.code !== 'auth/popup-closed-by-user') {
        this.mostrarError(this.traducirError(e.code));
      }
    }
  }

  async loginConFacebook() {
    const loading = await this.loadingCtrl.create({ message: 'Conectando con Facebook...' });
    await loading.present();
    try {
      await this.auth.loginConFacebook();
      await loading.dismiss();
      this.router.navigate(['/home'], { replaceUrl: true });
    } catch (e: any) {
      await loading.dismiss();
      if (e.code !== 'auth/popup-closed-by-user') {
        this.mostrarError(this.traducirError(e.code));
      }
    }
  }

  async loginConApple() {
    const loading = await this.loadingCtrl.create({ message: 'Conectando con Apple...' });
    await loading.present();
    try {
      await this.auth.loginConApple();
      await loading.dismiss();
      this.router.navigate(['/home'], { replaceUrl: true });
    } catch (e: any) {
      await loading.dismiss();
      if (e.code !== 'auth/popup-closed-by-user') {
        this.mostrarError(this.traducirError(e.code));
      }
    }
  }

  irRegistro() { this.router.navigate(['/registro']); }

  private async mostrarError(msg: string) {
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: msg,
      buttons: ['OK']
    });
    await alert.present();
  }

  private traducirError(code: string): string {
    const errores: any = {
      'auth/user-not-found': 'No existe una cuenta con ese correo',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-email': 'Correo electrónico inválido',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/invalid-credential': 'Correo o contraseña incorrectos',
      'auth/operation-not-allowed': 'Este método de inicio de sesión no está habilitado',
      'auth/account-exists-with-different-credential': 'Ya existe una cuenta con ese correo usando otro método'
    };
    return errores[code] || 'Error al iniciar sesión';
  }
}
