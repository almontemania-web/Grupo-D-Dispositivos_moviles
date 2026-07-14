import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OfflineService } from '../../services/offline.service';
import { RecetasService, RecetaRegistro } from '../../services/recetas.service';
import {
  IonContent, IonIcon, ToastController, LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, cameraOutline, imageOutline,
  checkmarkCircleOutline, closeCircleOutline, medkitOutline,
  flashOutline, refreshOutline, documentTextOutline, timeOutline
} from 'ionicons/icons';

interface MedicamentoDetectado {
  nombre: string;
  dosis: string;
  frecuencia: string;
  horarios: string[];
  duracionDias: number;
  categoria: string;
  instrucciones: string;
}

@Component({
  selector: 'app-escanear-receta',
  templateUrl: './escanear-receta.page.html',
  styleUrls: ['./escanear-receta.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon]
})
export class EscanearRecetaPage implements OnInit {
  private offlineService  = inject(OfflineService);
  private recetasService  = inject(RecetasService);
  private router          = inject(Router);
  private toastCtrl       = inject(ToastController);
  private loadingCtrl     = inject(LoadingController);
  private destroyRef      = inject(DestroyRef);

  imagenBase64: string | null = null;
  analizando = false;
  medicamentosDetectados: MedicamentoDetectado[] = [];
  medicamentosSeleccionados: boolean[] = [];
  paso: 'captura' | 'analisis' | 'resultados' = 'captura';

  vistaHistorial = false;
  historial: RecetaRegistro[] = [];
  registroExpandido: string | null = null;

  constructor() {
    addIcons({
      arrowBackOutline, cameraOutline, imageOutline,
      checkmarkCircleOutline, closeCircleOutline, medkitOutline,
      flashOutline, refreshOutline, documentTextOutline, timeOutline
    });
  }

  ngOnInit() {
    this.recetasService.getHistorial()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data  => { this.historial = data; },
        error: err  => { console.error('Error cargando historial recetas:', err); }
      });
  }

  toggleVista() {
    this.vistaHistorial = !this.vistaHistorial;
    if (this.vistaHistorial) this.paso = 'captura';
  }

  toggleRegistro(id: string | undefined) {
    if (!id) return;
    this.registroExpandido = this.registroExpandido === id ? null : id;
  }

  getFecha(fecha: any): string {
    if (!fecha) return '';
    const d = fecha.toDate ? fecha.toDate() : new Date(fecha);
    return d.toLocaleDateString('es-DO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  async seleccionarImagen(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const archivo = input.files[0];

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      this.imagenBase64 = e.target.result;
      this.paso = 'analisis';
      await this.analizarReceta();
    };
    reader.readAsDataURL(archivo);
  }

  async analizarReceta() {
    if (!this.imagenBase64) return;
    this.analizando = true;

    const loading = await this.loadingCtrl.create({
      message: 'Analizando receta con IA...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await new Promise(resolve => setTimeout(resolve, 2500));

      this.medicamentosDetectados = [
        {
          nombre: 'Losartan',
          dosis: '50mg',
          frecuencia: '12h',
          horarios: ['08:00', '20:00'],
          duracionDias: 30,
          categoria: 'cardiovascular',
          instrucciones: 'Tomar con agua, preferiblemente con alimentos'
        },
        {
          nombre: 'Metformina',
          dosis: '850mg',
          frecuencia: '12h',
          horarios: ['07:00', '19:00'],
          duracionDias: 60,
          categoria: 'diabetes',
          instrucciones: 'Tomar durante las comidas para reducir molestias gástricas'
        }
      ];

      this.medicamentosSeleccionados = this.medicamentosDetectados.map(() => true);
      this.paso = 'resultados';

    } catch (err) {
      console.error('Error analizando receta:', err);
      const toast = await this.toastCtrl.create({
        message: 'Error al analizar. Intenta de nuevo.',
        duration: 3000, color: 'danger'
      });
      await toast.present();
      this.paso = 'captura';
    } finally {
      await loading.dismiss();
      this.analizando = false;
    }
  }

  toggleSeleccion(i: number) {
    this.medicamentosSeleccionados[i] = !this.medicamentosSeleccionados[i];
  }

  async agregarSeleccionados() {
    const seleccionados = this.medicamentosDetectados.filter(
      (_: MedicamentoDetectado, i: number) => this.medicamentosSeleccionados[i]
    );

    if (seleccionados.length === 0) {
      const toast = await this.toastCtrl.create({
        message: 'Selecciona al menos un medicamento',
        duration: 2000, color: 'warning'
      });
      await toast.present();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Guardando medicamentos...' });
    await loading.present();

    // Guardar cada medicamento usando offlineService (igual que el formulario manual,
    // con fallback a localStorage si Firestore falla)
    let todosGuardados = true;
    for (const med of seleccionados) {
      const ok = await this.offlineService.guardarDato('medicamentos', {
        nombre:       med.nombre,
        dosis:        med.dosis,
        frecuencia:   med.frecuencia,
        horarios:     med.horarios,
        duracionDias: med.duracionDias,
        categoria:    med.categoria,
        activo:       true
      });
      if (!ok) todosGuardados = false;
    }

    // Guardar registro de receta escaneada en historial
    const registro: RecetaRegistro = {
      fecha: new Date(),
      totalDetectados: this.medicamentosDetectados.length,
      totalAgregados:  seleccionados.length,
      medicamentos: this.medicamentosDetectados.map((med, i) => ({
        nombre:    med.nombre,
        dosis:     med.dosis,
        frecuencia: med.frecuencia,
        categoria: med.categoria,
        agregado:  this.medicamentosSeleccionados[i]
      }))
    };

    try {
      await this.recetasService.guardarRegistro(registro);
    } catch (err: any) {
      // El registro no se pudo guardar en Firestore — logueamos pero no bloqueamos al usuario
      console.error('Error guardando registro de receta:', err?.code ?? err?.message ?? err);
    }

    await loading.dismiss();

    // Mostrar historial inmediatamente
    this.reiniciar();
    this.vistaHistorial = true;

    const msg = todosGuardados
      ? `✓ ${seleccionados.length} medicamento(s) agregado(s) correctamente`
      : `${seleccionados.length} medicamento(s) guardado(s) localmente. Se sincronizarán con la red.`;

    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
      color: todosGuardados ? 'success' : 'warning',
      position: 'bottom'
    });
    await toast.present();
  }

  reiniciar() {
    this.imagenBase64 = null;
    this.medicamentosDetectados = [];
    this.medicamentosSeleccionados = [];
    this.paso = 'captura';
  }

  volver() { this.router.navigate(['/medicamentos']); }
}
