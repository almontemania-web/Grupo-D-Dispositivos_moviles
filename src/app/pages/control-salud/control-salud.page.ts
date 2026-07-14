import { Component, DestroyRef, inject, Injector, OnInit, runInInjectionContext } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Firestore, collection, addDoc, collectionData, query, orderBy, limit } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { IonContent, IonIcon, ToastController, AlertController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, addOutline, heartOutline,
  trendingUpOutline, trendingDownOutline, removeOutline,
  waterOutline, pulseOutline, warningOutline, callOutline
} from 'ionicons/icons';
import { Observable } from 'rxjs';

interface MedicionSalud {
  id?: string;
  tipo: string;
  valor1: number;
  valor2?: number;
  fecha: any;
  nota: string;
  estado: string;
}

@Component({
  selector: 'app-control-salud',
  templateUrl: './control-salud.page.html',
  styleUrls: ['./control-salud.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon]
})
export class ControlSaludPage implements OnInit {
  private firestore  = inject(Firestore);
  private auth       = inject(Auth);
  private router     = inject(Router);
  private toastCtrl  = inject(ToastController);
  private alertCtrl  = inject(AlertController);
  private destroyRef = inject(DestroyRef);
  private injector   = inject(Injector);

  tabActivo = 'presion';
  todasMediciones: MedicionSalud[] = [];
  mediciones: MedicionSalud[] = [];
  mostrarForm = false;
  cargando = true;

  sistolica = 0;
  diastolica = 0;
  glucosa = 0;
  nota = '';

  private get uid(): string {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('Usuario no autenticado');
    return uid;
  }

  constructor() {
    addIcons({
      arrowBackOutline, addOutline, heartOutline,
      trendingUpOutline, trendingDownOutline, removeOutline,
      waterOutline, pulseOutline, warningOutline, callOutline
    });
  }

  ngOnInit() {
    const ref = collection(this.firestore, `usuarios/${this.uid}/mediciones`);
    const q = query(ref, orderBy('fecha', 'desc'), limit(200));
    (collectionData(q, { idField: 'id' }) as Observable<MedicionSalud[]>)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        this.todasMediciones = data;
        this.filtrarPorTab();
        this.cargando = false;
      });
  }

  private filtrarPorTab() {
    this.mediciones = this.todasMediciones.filter(m => m.tipo === this.tabActivo);
  }

  cambiarTab(tab: string) {
    this.tabActivo = tab;
    this.mostrarForm = false;
    this.filtrarPorTab();
  }

  getEstadoPresion(s: number, d: number): string {
    if (s < 120 && d < 80) return 'normal';
    if (s < 130 && d < 80) return 'elevada';
    if (s < 140 || d < 90) return 'alta1';
    return 'alta2';
  }

  getEstadoGlucosa(g: number): string {
    if (g < 70) return 'baja';
    if (g < 100) return 'normal';
    if (g < 126) return 'prediabetes';
    return 'diabetes';
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'normal': 'Normal', 'elevada': 'Elevada',
      'alta1': 'Alta I', 'alta2': 'Alta II',
      'baja': 'Baja', 'prediabetes': 'Prediabetes', 'diabetes': 'Diabetes'
    };
    return labels[estado] ?? estado;
  }

  getEstadoColor(estado: string): string {
    const colors: Record<string, string> = {
      'normal': '#2e7d32', 'elevada': '#f57f17',
      'alta1': '#e65100', 'alta2': '#c62828',
      'baja': '#1565c0', 'prediabetes': '#e65100', 'diabetes': '#c62828'
    };
    return colors[estado] ?? '#666';
  }

  getFecha(fecha: any): string {
    if (!fecha) return '';
    const d = fecha.toDate ? fecha.toDate() : new Date(fecha);
    return d.toLocaleDateString('es-DO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  getUltimaMedicion(): MedicionSalud | null {
    return this.mediciones[0] ?? null;
  }

  async guardar() {
    let medicion: MedicionSalud;

    if (this.tabActivo === 'presion') {
      if (!this.sistolica || !this.diastolica) {
        this.mostrarToast('Ingresa los valores de presión', 'warning');
        return;
      }
      medicion = {
        tipo: 'presion',
        valor1: this.sistolica,
        valor2: this.diastolica,
        fecha: new Date(),
        nota: this.nota,
        estado: this.getEstadoPresion(this.sistolica, this.diastolica)
      };
    } else {
      if (!this.glucosa) {
        this.mostrarToast('Ingresa el valor de glucosa', 'warning');
        return;
      }
      medicion = {
        tipo: 'glucosa',
        valor1: this.glucosa,
        fecha: new Date(),
        nota: this.nota,
        estado: this.getEstadoGlucosa(this.glucosa)
      };
    }

    await runInInjectionContext(this.injector, () =>
      addDoc(collection(this.firestore, `usuarios/${this.uid}/mediciones`), medicion)
    );
    this.sistolica = 0;
    this.diastolica = 0;
    this.glucosa = 0;
    this.nota = '';
    this.mostrarForm = false;
    this.mostrarToast('Medición guardada', 'success');

    if (medicion.estado !== 'normal') {
      await this.mostrarAlarma(medicion);
    }
  }

  private async mostrarAlarma(med: MedicionSalud) {
    const esCritico = ['alta2', 'diabetes', 'baja'].includes(med.estado);

    const mensajes: Record<string, string> = {
      'elevada':    'Tu presión está ligeramente elevada. Descansa y monitorea con frecuencia.',
      'alta1':      'Tu presión está alta. Evita el esfuerzo físico y consulta a tu médico pronto.',
      'alta2':      'Tu presión está muy alta. Busca atención médica inmediata.',
      'baja':       'Tu lectura está por debajo de lo normal. Siéntate, hidratate y busca atención si persiste.',
      'prediabetes':'Tu glucosa indica prediabetes. Consulta a tu médico para una evaluación.',
      'diabetes':   'Tu nivel de glucosa es muy elevado. Consulta a tu médico de inmediato.'
    };

    const alert = await this.alertCtrl.create({
      header: esCritico ? '⚠️ Alerta de Salud' : '⚡ Atención',
      message: mensajes[med.estado] ?? 'Tus valores no están dentro del rango normal.',
      buttons: esCritico
        ? [
            { text: 'Llamar 911', role: 'destructive', handler: () => { window.open('tel:911'); } },
            { text: 'Entendido', role: 'cancel' }
          ]
        : [{ text: 'Entendido', role: 'cancel' }]
    });
    await alert.present();
  }

  private async mostrarToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg, duration: 2000, color, position: 'bottom'
    });
    await toast.present();
  }

  volverHome() { this.router.navigate(['/home']); }
}
