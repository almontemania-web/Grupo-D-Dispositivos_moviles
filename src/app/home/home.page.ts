import { NotificacionesService } from '../services/notificaciones.service';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PerfilService } from '../services/perfil.service';
import { MedicamentosService, Medicamento } from '../services/medicamentos.service';
import {
  IonContent, IonIcon, IonMenuButton,
  AlertController, MenuController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  heartOutline, personOutline, medkitOutline, calendarOutline,
  locationOutline, callOutline, notificationsOutline,
  checkmarkCircleOutline, timeOutline, logOutOutline,
  warningOutline, shieldCheckmarkOutline, peopleOutline,
  businessOutline, chevronForwardOutline, homeOutline,
  clipboardOutline, alertCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonMenuButton]
})
export class HomePage implements OnInit {
  private auth = inject(AuthService);
  private perfilService = inject(PerfilService);
  private medService = inject(MedicamentosService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);
  private notifService = inject(NotificacionesService);
  private menuCtrl = inject(MenuController);
  private destroyRef = inject(DestroyRef);

  nombreUsuario = 'Usuario';
  fotoUrl: string | null = null;
  saludo = '';
  medicamentos: Medicamento[] = [];
  proximasDosis: Medicamento[] = [];
  totalActivos = 0;
  hayAlertas = false;

  constructor() {
    addIcons({
      heartOutline, personOutline, medkitOutline, calendarOutline,
      locationOutline, callOutline, notificationsOutline,
      checkmarkCircleOutline, timeOutline, logOutOutline,
      warningOutline, shieldCheckmarkOutline, peopleOutline,
      businessOutline, chevronForwardOutline, homeOutline,
      clipboardOutline, alertCircleOutline
    });
  }

  ngOnInit() {
    this.menuCtrl.enable(true, 'main-menu');
    this.menuCtrl.close('main-menu');

    this.auth.user$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async user => {
      if (!user) {
        this.router.navigate(['/login'], { replaceUrl: true });
        return;
      }

      this.fotoUrl = user.photoURL || null;

      // 1. displayName ya configurado (cuentas nuevas o Google/Apple)
      if (user.displayName) {
        this.nombreUsuario = user.displayName;
        return;
      }

      // 2. Leer de localStorage / Firestore (cuentas antiguas sin displayName)
      try {
        const userData = await this.perfilService.getUsuario();
        if (userData?.nombre) {
          const ap = userData.apellido || '';
          const nombreCompleto = ap ? `${userData.nombre} ${ap}`.trim() : userData.nombre;
          this.nombreUsuario = nombreCompleto;

          // Actualizar displayName para que funcione desde la próxima sesión
          try {
            const { updateProfile } = await import('@angular/fire/auth');
            const cu = this.auth.authInstance.currentUser;
            if (cu && !cu.displayName) {
              await updateProfile(cu, { displayName: nombreCompleto });
            }
          } catch { /* no crítico */ }
          return;
        }
      } catch { /* continúa al fallback */ }

      // 3. Último recurso: usar la parte del email
      this.nombreUsuario = user.email?.split('@')[0] || 'Usuario';
    });

    this.medService.getMedicamentos().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(meds => {
      this.medicamentos = meds;
      this.totalActivos = meds.filter(m => m.activo).length;
      this.proximasDosis = meds.filter(m => m.activo).slice(0, 3);
      this.hayAlertas = meds.some(m => !m.activo);
      this.notifService.programarMedicamentos(meds);
    });

    // Re-programar alarmas de citas al iniciar la app
    try {
      const uid = this.auth.authInstance.currentUser?.uid;
      if (uid) {
        const raw = localStorage.getItem(`citas_${uid}`);
        const citas = raw ? JSON.parse(raw) : [];
        this.notifService.programarCitas(citas);
      }
    } catch (e) { console.warn('programarCitas init error:', e); }

    this.setSaludo();
  }

  setSaludo() {
    const hora = new Date().getHours();
    if (hora < 12) this.saludo = 'Buenos días';
    else if (hora < 18) this.saludo = 'Buenas tardes';
    else this.saludo = 'Buenas noches';
  }

  getColorMed(categoria: string): string {
    const colores: Record<string, string> = {
      'cardiovascular': '#4FC3F7',
      'diabetes': '#68D391',
      'dolor': '#F6AD55',
      'vitaminas': '#B794F4',
      'otro': '#FC8181'
    };
    return colores[categoria] ?? '#4FC3F7';
  }

  getProximaHora(): string {
    if (this.proximasDosis.length === 0) return '';
    const horarios: string[] = this.proximasDosis.flatMap((m: Medicamento) => m.horarios).sort();
    const ahora = new Date();
    const horaActual = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;
    return horarios.find((h: string) => h > horaActual) ?? horarios[0] ?? '';
  }

  irA(ruta: string) { this.router.navigate(['/' + ruta]); }

  async confirmarSalida() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Estás seguro que deseas salir?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Salir', handler: () => this.auth.logout() }
      ]
    });
    await alert.present();
  }

  llamarEmergencia() { window.open('tel:911'); }
}
