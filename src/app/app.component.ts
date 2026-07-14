import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './services/auth.service';
import { PerfilService } from './services/perfil.service';
import { NetworkService } from './services/network.service';
import { NetworkBannerComponent } from './components/network-banner/network-banner.component';
import {
  IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar,
  IonContent, IonList, IonItem, IonIcon, IonLabel,
  IonMenuToggle
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { addIcons } from 'ionicons';
import {
  homeOutline, personOutline, medkitOutline, documentTextOutline,
  calendarOutline, locationOutline, alertCircleOutline,
  settingsOutline, callOutline, heartOutline, logOutOutline,
  chevronForwardOutline, pulseOutline, newspaperOutline, scanOutline,
  qrCodeOutline, playCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterLink, IonApp, IonRouterOutlet, IonMenu, IonHeader,
    IonToolbar, IonContent, IonList, IonItem,
    IonIcon, IonLabel, IonMenuToggle,
    NetworkBannerComponent,
  ]
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  private perfilService = inject(PerfilService);
  private networkService = inject(NetworkService);
  private destroyRef = inject(DestroyRef);

  fotoUrl: string | null = null;
  nombreUsuario = '';
  emailUsuario = '';

  menuItems = [
    { label: 'Inicio',            icon: 'home-outline',          ruta: '/home',           color: '#0D3B8E' },
    { label: 'Mi Perfil Médico',  icon: 'person-outline',        ruta: '/perfil-medico',  color: '#0FA3B1' },
    { label: 'Medicamentos',      icon: 'medkit-outline',        ruta: '/medicamentos',   color: '#4CAF50' },
    { label: 'Historial Médico',  icon: 'document-text-outline', ruta: '/historial',      color: '#FF9800' },
    { label: 'Citas Médicas',     icon: 'calendar-outline',      ruta: '/citas',          color: '#2196F3' },
    { label: 'Carné Digital',     icon: 'newspaper-outline',     ruta: '/carne-digital',  color: '#0D3B8E' },
    { label: 'Control de Salud',  icon: 'pulse-outline',         ruta: '/control-salud',  color: '#0FA3B1' },
    { label: 'Ubicación',         icon: 'location-outline',      ruta: '/emergencia',     color: '#4CAF50' },
    { label: 'Emergencias',       icon: 'alert-circle-outline',  ruta: '/emergencia',     color: '#D32F2F' },
    { label: 'Escanear Receta',   icon: 'scan-outline',          ruta: '/escanear-receta', color: '#2196F3' },
    { label: 'Escanear QR Medicamento', icon: 'qr-code-outline', ruta: '/escanear-qr',   color: '#0FA3B1' },
    { label: 'Video demostrativo', icon: 'play-circle-outline',  ruta: '/multimedia',     color: '#4CAF50' },
  ];

  constructor() {
    addIcons({
      homeOutline, personOutline, medkitOutline, documentTextOutline,
      calendarOutline, locationOutline, alertCircleOutline,
      settingsOutline, callOutline, heartOutline, logOutOutline,
      chevronForwardOutline, pulseOutline, newspaperOutline, scanOutline,
      qrCodeOutline, playCircleOutline
    });
    this.networkService.init();
  }

  ngOnInit() {
    this.auth.user$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(async user => {
      if (user) {
        this.emailUsuario = user.email || '';
        this.fotoUrl = user.photoURL || null;

        if (user.displayName) {
          this.nombreUsuario = user.displayName;
        } else {
          try {
            const userData = await this.perfilService.getUsuario();
            if (userData?.nombre) {
              const ap = userData.apellido || '';
              this.nombreUsuario = ap ? `${userData.nombre} ${ap}`.trim() : userData.nombre;
            } else {
              this.nombreUsuario = user.email?.split('@')[0] || 'Usuario';
            }
          } catch {
            this.nombreUsuario = user.email?.split('@')[0] || 'Usuario';
          }
        }
      }
    });
  }

  irA(ruta: string) { this.router.navigate([ruta]); }
  logout() { this.auth.logout(); }
}
