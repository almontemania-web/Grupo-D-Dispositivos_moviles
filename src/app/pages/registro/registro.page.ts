import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  IonContent, IonButton, IonInput, IonItem, IonSelect, IonSelectOption,
  IonSpinner, IonIcon, AlertController, LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heartOutline, eyeOutline, eyeOffOutline, arrowBackOutline } from 'ionicons/icons';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonButton,
    IonInput, IonItem, IonSelect, IonSelectOption, IonSpinner, IonIcon]
})
export class RegistroPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private loadingCtrl = inject(LoadingController);

  nombre = '';
  apellido = '';
  email = '';
  password = '';
  confirmarPassword = '';
  planSalud = '';
  noAfiliado = '';
  fechaNacimiento = '';

  mostrarPassword = false;
  cargando = false;

  maxFecha = new Date().toISOString().split('T')[0];

  planesARS = [
    'ARS Senasa (IDSS)',
    'ARS Humano',
    'ARS Salud Segura',
    'ARS Universal',
    'ARS Meta Salud',
    'ARS Yunen',
    'ARS Semma',
    'ARS Renacer',
    'ARS Reservas',
    'ARS Colonial',
    'ARS Mapfre BHD',
    'ARS Plan Básico (CNSS)',
    'ARS Asemap',
    'ARS CMD',
    'ARS Nacional de Salud',
    'ARS Primera',
    'ARS Monumental',
    'ARS Futuro',
    'ARS Palic',
    'ARS Integral',
    'ARS SPN',
    'ARS Dominicana de Seguros',
    'ARS Capital',
    'ARS Materno Infantil',
    'Otro',
    'Sin plan de salud'
  ];

  constructor() {
    addIcons({ heartOutline, eyeOutline, eyeOffOutline, arrowBackOutline });
  }

  async registrarse() {
    if (!this.nombre || !this.apellido || !this.email || !this.password || !this.confirmarPassword) {
      this.mostrarError('Por favor completa todos los campos obligatorios');
      return;
    }
    if (this.password !== this.confirmarPassword) {
      this.mostrarError('Las contraseñas no coinciden');
      return;
    }
    if (this.password.length < 6) {
      this.mostrarError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Creando cuenta...' });
    await loading.present();
    try {
      await this.auth.registro(
        this.email.trim(), this.password, this.nombre.trim(),
        this.apellido.trim(), this.planSalud, this.noAfiliado.trim(), this.fechaNacimiento
      );
      await loading.dismiss();
      this.router.navigate(['/home'], { replaceUrl: true });
    } catch (e: any) {
      await loading.dismiss();
      this.mostrarError(this.traducirError(e.code));
    }
  }

  irLogin() { this.router.navigate(['/login']); }

  private async mostrarError(msg: string) {
    const alert = await this.alertCtrl.create({ header: 'Error', message: msg, buttons: ['OK'] });
    await alert.present();
  }

  private traducirError(code: string): string {
    const errores: Record<string, string> = {
      'auth/email-already-in-use': 'Ya existe una cuenta con ese correo electrónico',
      'auth/invalid-email': 'El correo electrónico no es válido',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/operation-not-allowed': 'El registro con correo no está habilitado',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/internal-error': 'Error interno. Intenta de nuevo'
    };
    return errores[code] || `Error al crear la cuenta (${code || 'desconocido'})`;
  }
}
