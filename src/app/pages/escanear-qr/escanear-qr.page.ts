import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent, IonIcon, ToastController, LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, qrCodeOutline, flashOutline, checkmarkCircleOutline,
  timeOutline, medkitOutline, alertCircleOutline, trashOutline
} from 'ionicons/icons';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { MedicamentoApiService } from '../../services/medicamento-api.service';
import { QrHistorialService, QrEscaneo } from '../../services/qr-historial.service';
import { MedicamentoInfo } from '../../models/medicamento-info.model';

@Component({
  selector: 'app-escanear-qr',
  templateUrl: './escanear-qr.page.html',
  styleUrls: ['./escanear-qr.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon]
})
export class EscanearQrPage {
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private apiService = inject(MedicamentoApiService);
  private historialService = inject(QrHistorialService);
  private destroyRef = inject(DestroyRef);

  escaneando = false;
  codigoLeido: string | null = null;
  infoMedicamento: MedicamentoInfo | null = null;
  buscoInfo = false;
  historial: QrEscaneo[] = [];

  constructor() {
    addIcons({
      arrowBackOutline, qrCodeOutline, flashOutline, checkmarkCircleOutline,
      timeOutline, medkitOutline, alertCircleOutline, trashOutline
    });
    this.cargarHistorial();
  }

  async cargarHistorial() {
    this.historial = await this.historialService.obtenerHistorial();
  }

  async escanear() {
    try {
      const permiso = await BarcodeScanner.checkPermissions();
      if (permiso.camera !== 'granted') {
        const solicitado = await BarcodeScanner.requestPermissions();
        if (solicitado.camera !== 'granted') {
          const toast = await this.toastCtrl.create({
            message: 'Se necesita permiso de cámara para escanear el código QR',
            duration: 3000, color: 'warning'
          });
          await toast.present();
          return;
        }
      }

      this.escaneando = true;
      const resultado = await BarcodeScanner.scan();
      this.escaneando = false;

      if (resultado.barcodes.length === 0) return;

      const valor = resultado.barcodes[0].displayValue || resultado.barcodes[0].rawValue || '';
      this.codigoLeido = valor;
      await this.buscarInfo(valor);

    } catch (err) {
      this.escaneando = false;
      console.error('Error escaneando QR:', err);
      const toast = await this.toastCtrl.create({
        message: 'No se pudo iniciar el escáner. Verifica los permisos de cámara.',
        duration: 3000, color: 'danger'
      });
      await toast.present();
    }
  }

  private async buscarInfo(codigo: string) {
    this.buscoInfo = true;
    const loading = await this.loadingCtrl.create({ message: 'Consultando información del medicamento...' });
    await loading.present();

    this.apiService.buscarPorNombre(codigo)
      .subscribe({
        next: async (info) => {
          this.infoMedicamento = info;
          await this.historialService.guardarEscaneo(codigo, info);
          await this.cargarHistorial();
          await loading.dismiss();
          this.buscoInfo = false;
        },
        error: async () => {
          this.infoMedicamento = null;
          await loading.dismiss();
          this.buscoInfo = false;
        }
      });
  }

  nuevoEscaneo() {
    this.codigoLeido = null;
    this.infoMedicamento = null;
  }

  async limpiarHistorial() {
    await this.historialService.limpiarHistorial();
    await this.cargarHistorial();
  }

  volver() { this.router.navigate(['/home']); }
}
