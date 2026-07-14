import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PerfilService, PerfilMedico, UsuarioData } from '../../services/perfil.service';
import { FotoService } from '../../services/foto.service';
import {
  IonContent, IonIcon, IonInput, IonItem, IonSelect, IonSelectOption,
  ToastController, LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, personOutline, addOutline, trashOutline,
  callOutline, heartOutline, saveOutline, medkitOutline, cameraOutline,
  shieldCheckmarkOutline, idCardOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-perfil-medico',
  templateUrl: './perfil-medico.page.html',
  styleUrls: ['./perfil-medico.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon,
    IonInput, IonItem, IonSelect, IonSelectOption]
})
export class PerfilMedicoPage implements OnInit {
  private perfilService = inject(PerfilService);
  private fotoService = inject(FotoService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  perfil: PerfilMedico = {
    nombre: '', edad: 0, tipoSanguineo: 'O+',
    alergias: [], enfermedades: [],
    contactoEmergenciaNombre: '', contactoEmergenciaTelefono: '',
    telefono: ''
  };

  // Datos del registro (root doc usuarios/{uid})
  apellido = '';
  fechaNacimiento = '';
  planSalud = '';
  noAfiliado = '';
  email = '';
  vigente = true;

  fotoUrl: string | null = null;
  nuevaAlergia = '';
  nuevaEnfermedad = '';
  cargando = true;

  tiposSanguineos = ['A+','A-','B+','B-','AB+','AB-','O+','O-'];

  maxFecha = new Date().toISOString().split('T')[0];

  planesARS = [
    'ARS Senasa (IDSS)', 'ARS Humano', 'ARS Salud Segura', 'ARS Universal',
    'ARS Meta Salud', 'ARS Yunen', 'ARS Semma', 'ARS Renacer', 'ARS Reservas',
    'ARS Colonial', 'ARS Mapfre BHD', 'ARS Plan Básico (CNSS)', 'ARS Asemap',
    'ARS CMD', 'ARS Nacional de Salud', 'ARS Primera', 'ARS Monumental',
    'ARS Futuro', 'ARS Palic', 'ARS Integral', 'ARS SPN',
    'ARS Dominicana de Seguros', 'ARS Capital', 'ARS Materno Infantil',
    'Otro', 'Sin plan de salud'
  ];

  constructor() {
    addIcons({
      arrowBackOutline, personOutline, addOutline, trashOutline,
      callOutline, heartOutline, saveOutline, medkitOutline, cameraOutline,
      shieldCheckmarkOutline, idCardOutline
    });
  }

  async ngOnInit() {
    const [perfilData, usuario] = await Promise.all([
      this.perfilService.getPerfil(),
      this.perfilService.getUsuario()
    ]);

    if (usuario) {
      this.apellido       = usuario.apellido       || '';
      this.fechaNacimiento = usuario.fechaNacimiento || '';
      this.planSalud      = usuario.planSalud      || '';
      this.noAfiliado     = usuario.noAfiliado     || '';
      this.email          = usuario.email          || '';
      this.vigente        = usuario.vigente        ?? true;
    }

    if (perfilData) {
      this.perfil = perfilData;
    } else if (usuario) {
      // Pre-poblar nombre desde el registro si no hay perfil médico aún
      const ap = usuario.apellido || '';
      this.perfil.nombre = ap ? `${usuario.nombre} ${ap}`.trim() : usuario.nombre;
    }

    this.fotoUrl = await this.fotoService.getFotoUrl();
    this.cargando = false;
  }

  async seleccionarFoto(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const archivo = input.files[0];

    const loading = await this.loadingCtrl.create({ message: 'Subiendo foto...' });
    await loading.present();
    try {
      this.fotoUrl = await this.fotoService.subirFoto(archivo);
      await loading.dismiss();
      this.toast('Foto actualizada correctamente', 'success');
    } catch (e) {
      await loading.dismiss();
      this.toast('Error al subir la foto', 'danger');
    }
  }

  agregarAlergia() {
    if (this.nuevaAlergia.trim()) {
      this.perfil.alergias.push(this.nuevaAlergia.trim());
      this.nuevaAlergia = '';
    }
  }

  eliminarAlergia(i: number) { this.perfil.alergias.splice(i, 1); }

  agregarEnfermedad() {
    if (this.nuevaEnfermedad.trim()) {
      this.perfil.enfermedades.push(this.nuevaEnfermedad.trim());
      this.nuevaEnfermedad = '';
    }
  }

  eliminarEnfermedad(i: number) { this.perfil.enfermedades.splice(i, 1); }

  async guardar() {
    if (!this.perfil.nombre) {
      this.toast('El nombre es obligatorio', 'warning');
      return;
    }
    const loading = await this.loadingCtrl.create({ message: 'Guardando perfil...' });
    await loading.present();
    try {
      await Promise.all([
        this.perfilService.guardarPerfil(this.perfil),
        this.perfilService.guardarUsuario({
          apellido: this.apellido,
          fechaNacimiento: this.fechaNacimiento,
          planSalud: this.planSalud,
          noAfiliado: this.noAfiliado
        })
      ]);
      await loading.dismiss();
      this.toast('Perfil guardado correctamente', 'success');
    } catch (e) {
      await loading.dismiss();
      this.toast('Error al guardar el perfil', 'danger');
    }
  }

  private async toast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2500, color, position: 'bottom' });
    await t.present();
  }

  volverHome() { this.router.navigate(['/home']); }
}
