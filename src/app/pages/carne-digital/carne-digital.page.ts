import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PerfilService, PerfilMedico, UsuarioData } from '../../services/perfil.service';
import { AuthService } from '../../services/auth.service';
import { MedicamentosService, Medicamento } from '../../services/medicamentos.service';
import { IonContent, IonIcon, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, cardOutline, heartOutline,
  medkitOutline, callOutline, personOutline,
  alertCircleOutline, shareOutline, checkmarkCircleOutline,
  closeCircleOutline, calendarOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-carne-digital',
  templateUrl: './carne-digital.page.html',
  styleUrls: ['./carne-digital.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon]
})
export class CarneDigitalPage implements OnInit {
  private perfilService = inject(PerfilService);
  private authService = inject(AuthService);
  private medService = inject(MedicamentosService);
  private toastCtrl = inject(ToastController);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  perfil: PerfilMedico | null = null;
  usuario: UsuarioData | null = null;
  medicamentosActivos: Medicamento[] = [];
  emailUsuario = '';
  cargando = true;

  constructor() {
    addIcons({
      arrowBackOutline, cardOutline, heartOutline,
      medkitOutline, callOutline, personOutline,
      alertCircleOutline, shareOutline, checkmarkCircleOutline,
      closeCircleOutline, calendarOutline
    });
  }

  async ngOnInit() {
    this.authService.user$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(user => {
      if (user) this.emailUsuario = user.email || '';
    });

    const [perfil, usuario] = await Promise.all([
      this.perfilService.getPerfil(),
      this.perfilService.getUsuario()
    ]);
    this.perfil = perfil;
    this.usuario = usuario;

    this.medService.getMedicamentos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(meds => {
        this.medicamentosActivos = meds.filter(m => m.activo);
        this.cargando = false;
      });
  }

  get nombreCompleto(): string {
    if (!this.usuario) return 'Usuario';
    const nombre = this.usuario.nombre || '';
    const apellido = this.usuario.apellido || '';
    return `${nombre} ${apellido}`.trim() || 'Usuario';
  }

  get iniciales(): string {
    const n = this.usuario?.nombre || '';
    const a = this.usuario?.apellido || '';
    return `${n.charAt(0)}${a.charAt(0)}`.toUpperCase() || 'U';
  }

  formatearFecha(f: string): string {
    if (!f) return 'No especificada';
    try {
      return new Date(f + 'T12:00:00').toLocaleDateString('es-DO', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
    } catch { return f; }
  }

  getFechaHoy(): string {
    return new Date().toLocaleDateString('es-DO', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  }

  async compartir() {
    const alergias = this.perfil?.alergias?.join(', ') || 'Ninguna';
    const enfermedades = this.perfil?.enfermedades?.join(', ') || 'Ninguna';
    const meds = this.medicamentosActivos.map(m => `${m.nombre} ${m.dosis}`).join(', ') || 'Ninguno';
    const contacto = `${this.perfil?.contactoEmergenciaNombre || 'N/A'} - ${this.perfil?.contactoEmergenciaTelefono || 'N/A'}`;
    const texto = `CARNÉ MÉDICO\nNombre: ${this.nombreCompleto}\nTipo sanguíneo: ${this.perfil?.tipoSanguineo || 'N/A'}\nPlan: ${this.usuario?.planSalud || 'N/A'}\nNo. Afiliado: ${this.usuario?.noAfiliado || 'N/A'}\nAlergias: ${alergias}\nCondiciones: ${enfermedades}\nMedicamentos: ${meds}\nEmergencia: ${contacto}`;

    if (navigator.share) {
      await navigator.share({ title: 'Mi Carné Médico', text: texto });
    } else {
      await navigator.clipboard.writeText(texto);
      const toast = await this.toastCtrl.create({
        message: 'Información copiada al portapapeles', duration: 2000, color: 'success', position: 'bottom'
      });
      await toast.present();
    }
  }

  volver() { this.router.navigate(['/home']); }
}
