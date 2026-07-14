import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MedicamentosService, Medicamento } from '../../services/medicamentos.service';
import { HistorialService } from '../../services/historial.service';
import {
  IonContent, IonIcon,
  AlertController, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline, trashOutline, medkitOutline, timeOutline,
  checkmarkCircleOutline, closeCircleOutline, arrowBackOutline,
  heartOutline, calendarOutline, fitnessOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-medicamentos',
  templateUrl: './medicamentos.page.html',
  styleUrls: ['./medicamentos.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon]
})
export class MedicamentosPage implements OnInit {
  private medService = inject(MedicamentosService);
  private historialService = inject(HistorialService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private destroyRef = inject(DestroyRef);

  medicamentos: Medicamento[] = [];
  cargando = true;

  constructor() {
    addIcons({
      addOutline, trashOutline, medkitOutline, timeOutline,
      checkmarkCircleOutline, closeCircleOutline, arrowBackOutline,
      heartOutline, calendarOutline, fitnessOutline
    });
  }

  ngOnInit() {
    this.medService.getMedicamentos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(meds => {
        this.medicamentos = meds;
        this.cargando = false;
      });
  }

  getIconoCategoria(categoria: string): string {
    const iconos: Record<string, string> = {
      'cardiovascular': 'heart-outline',
      'diabetes': 'medkit-outline',
      'dolor': 'medkit-outline',
      'vitaminas': 'medkit-outline',
      'otro': 'fitness-outline'
    };
    return iconos[categoria] ?? 'fitness-outline';
  }

  getColorCategoria(categoria: string): string {
    const colores: Record<string, string> = {
      'cardiovascular': '#4FC3F7',
      'diabetes': '#68D391',
      'dolor': '#F6AD55',
      'vitaminas': '#B794F4',
      'otro': '#FC8181'
    };
    return colores[categoria] ?? '#4FC3F7';
  }

  irAgregar() { this.router.navigate(['/agregar-medicamento']); }
  volverHome() { this.router.navigate(['/home']); }

  async marcarTomado(med: Medicamento) {
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
    await this.historialService.registrarToma({
      medicamentoNombre: med.nombre,
      dosis: med.dosis,
      hora,
      tomado: true,
      tipo: 'manual'
    });
    const toast = await this.toastCtrl.create({
      message: `${med.nombre} marcado como tomado`,
      duration: 2000,
      color: 'success',
      position: 'bottom',
      icon: 'checkmark-circle-outline'
    });
    await toast.present();
  }

  async confirmarEliminar(med: Medicamento) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar medicamento',
      message: `¿Eliminar ${med.nombre}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          cssClass: 'danger',
          handler: async () => {
            await this.medService.eliminarMedicamento(med.id!);
            this.mostrarToast(`${med.nombre} eliminado`);
          }
        }
      ]
    });
    await alert.present();
  }

  async toggleMedicamento(med: Medicamento) {
    await this.medService.toggleActivo(med.id!, !med.activo);
  }

  private async mostrarToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg, duration: 2000, position: 'bottom', color: 'success'
    });
    await toast.present();
  }
}
