import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PerfilService } from '../../services/perfil.service';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  callOutline, arrowBackOutline, locationOutline,
  heartOutline, medkitOutline, personOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-emergencia',
  templateUrl: './emergencia.page.html',
  styleUrls: ['./emergencia.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon]
})
export class EmergenciaPage {
  private router = inject(Router);
  private perfilService = inject(PerfilService);

  contactoNombre = '';
  contactoTelefono = '';

  constructor() {
    addIcons({
      callOutline, arrowBackOutline, locationOutline,
      heartOutline, medkitOutline, personOutline
    });
    this.cargarContacto();
  }

  async cargarContacto() {
    const perfil = await this.perfilService.getPerfil();
    if (perfil) {
      this.contactoNombre = perfil.contactoEmergenciaNombre || 'Sin contacto';
      this.contactoTelefono = perfil.contactoEmergenciaTelefono || '';
    }
  }

  llamar911() { window.open('tel:911'); }

  llamarContacto() {
    if (this.contactoTelefono) {
      window.open(`tel:${this.contactoTelefono}`);
    }
  }

  buscarHospitales() {
    window.open('https://www.google.com/maps/search/hospitales+cerca+de+mi');
  }

  volverHome() { this.router.navigate(['/home']); }
}