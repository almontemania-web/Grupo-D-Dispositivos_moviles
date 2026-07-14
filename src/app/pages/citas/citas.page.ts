import { Component, DestroyRef, inject, Injector, OnInit, runInInjectionContext } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Firestore, collection, addDoc, collectionData, deleteDoc, doc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { IonContent, IonIcon, AlertController, ToastController } from '@ionic/angular/standalone';
import { NotificacionesService } from '../../services/notificaciones.service';
import { addIcons } from 'ionicons';
import {
  addOutline, trashOutline, calendarOutline, arrowBackOutline,
  timeOutline, locationOutline, personOutline, medkitOutline,
  locateOutline, businessOutline, mapOutline, searchOutline,
  closeOutline, chevronDownOutline
} from 'ionicons/icons';
import { Observable } from 'rxjs';

interface Cita {
  id?: string;
  doctor: string;
  especialidad: string;
  fecha: string;
  hora: string;
  lugar: string;
  notas: string;
}

interface LugarResult {
  nombre: string;
  direccion: string;
  lat: number;
  lon: number;
  distancia?: number;
}

@Component({
  selector: 'app-citas',
  templateUrl: './citas.page.html',
  styleUrls: ['./citas.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon, DecimalPipe]
})
export class CitasPage implements OnInit {
  private firestore   = inject(Firestore);
  private auth        = inject(Auth);
  private router      = inject(Router);
  private alertCtrl   = inject(AlertController);
  private toastCtrl   = inject(ToastController);
  private destroyRef  = inject(DestroyRef);
  private injector    = inject(Injector);
  private notifService = inject(NotificacionesService);

  citas: Cita[] = [];
  mostrarForm = false;
  cargando = true;

  nueva: Cita = { doctor: '', especialidad: '', fecha: '', hora: '', lugar: '', notas: '' };

  minFecha = new Date().toISOString().split('T')[0];

  // Búsqueda de centros de salud
  busquedaLugar = '';
  lugaresResultados: LugarResult[] = [];
  buscando = false;
  private searchTimer: any;
  private userLat: number | null = null;
  private userLon: number | null = null;

  private get uid(): string {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('Usuario no autenticado');
    return uid;
  }

  constructor() {
    addIcons({
      addOutline, trashOutline, calendarOutline, arrowBackOutline,
      timeOutline, locationOutline, personOutline, medkitOutline,
      locateOutline, businessOutline, mapOutline, searchOutline,
      closeOutline, chevronDownOutline
    });
  }

  private lKey(): string { return `citas_${this.uid}`; }

  private getLocalCitas(): Cita[] {
    try {
      const d = localStorage.getItem(this.lKey());
      return d ? JSON.parse(d) : [];
    } catch { return []; }
  }

  private setLocalCitas(items: Cita[]): void {
    try { localStorage.setItem(this.lKey(), JSON.stringify(items)); } catch {}
  }

  ngOnInit() {
    // Cargar desde localStorage inmediatamente
    this.citas = this.getLocalCitas().sort((a, b) => a.fecha.localeCompare(b.fecha));
    this.cargando = false;

    // Intentar Firestore en paralelo
    try {
      const ref = collection(this.firestore, `usuarios/${this.uid}/citas`);
      (collectionData(ref, { idField: 'id' }) as Observable<Cita[]>)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: data => {
            if (data.length > 0) {
              this.citas = data.sort((a, b) => a.fecha.localeCompare(b.fecha));
              this.setLocalCitas(this.citas);
              this.notifService.programarCitas(this.citas);
            }
          },
          error: (e) => {
            console.warn('Firestore citas read error (using localStorage):', e?.code || e);
          }
        });
    } catch (e) {
      console.warn('Firestore init error:', e);
    }
  }

  formatearFecha(f: string): string {
    if (!f) return '';
    try {
      return new Date(f + 'T12:00:00').toLocaleDateString('es-DO', {
        day: '2-digit', month: 'long', year: 'numeric'
      });
    } catch { return f; }
  }

  // ── Geolocalización ──────────────────────────────────────────────────

  async buscarCerca() {
    if (!navigator.geolocation) {
      this.toast('Tu dispositivo no soporta geolocalización', 'warning');
      return;
    }
    this.buscando = true;
    this.lugaresResultados = [];

    navigator.geolocation.getCurrentPosition(
      async pos => {
        this.userLat = pos.coords.latitude;
        this.userLon = pos.coords.longitude;
        await this.buscarEnOverpass(this.userLat, this.userLon);
        this.buscando = false;
      },
      () => {
        this.buscando = false;
        this.toast('No se pudo obtener tu ubicación. Verifica los permisos.', 'danger');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  private async buscarEnOverpass(lat: number, lon: number) {
    const q = `[out:json][timeout:25];(node["amenity"~"hospital|clinic|doctors"](around:12000,${lat},${lon});way["amenity"~"hospital|clinic"](around:12000,${lat},${lon}););out center 20;`;
    try {
      const resp = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: q });
      const data = await resp.json();
      this.lugaresResultados = (data.elements as any[])
        .filter(e => e.tags?.name)
        .map(e => {
          const eLat = e.lat ?? e.center?.lat;
          const eLon = e.lon ?? e.center?.lon;
          return {
            nombre: e.tags.name,
            direccion: e.tags['addr:street']
              ? `${e.tags['addr:street']} ${e.tags['addr:housenumber'] ?? ''}`.trim()
              : (e.tags['addr:city'] ?? 'República Dominicana'),
            lat: eLat, lon: eLon,
            distancia: this.haversine(lat, lon, eLat, eLon)
          };
        })
        .sort((a, b) => (a.distancia ?? 0) - (b.distancia ?? 0))
        .slice(0, 15);

      if (this.lugaresResultados.length === 0) {
        this.toast('No se encontraron centros de salud en 12 km', 'warning');
      }
    } catch {
      this.toast('Error al buscar. Verifica tu conexión.', 'danger');
    }
  }

  onBusquedaChange() {
    this.nueva.lugar = this.busquedaLugar;
    clearTimeout(this.searchTimer);
    this.lugaresResultados = [];
    if (this.busquedaLugar.length < 3) return;
    this.buscando = true;
    this.searchTimer = setTimeout(() => this.buscarNominatim(), 600);
  }

  private async buscarNominatim() {
    const q = encodeURIComponent(`${this.busquedaLugar} hospital clinica`);
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=10&countrycodes=do&addressdetails=1`;
    try {
      const resp = await fetch(url, { headers: { 'Accept-Language': 'es' } });
      const data: any[] = await resp.json();
      this.lugaresResultados = data.map(e => ({
        nombre: e.name || e.display_name.split(',')[0],
        direccion: e.display_name.split(',').slice(1, 3).join(', ').trim(),
        lat: parseFloat(e.lat),
        lon: parseFloat(e.lon),
        distancia: this.userLat != null
          ? this.haversine(this.userLat, this.userLon!, parseFloat(e.lat), parseFloat(e.lon))
          : undefined
      }));
    } catch {
      this.toast('Error al buscar. Verifica tu conexión.', 'danger');
    } finally {
      this.buscando = false;
    }
  }

  seleccionarLugar(lugar: LugarResult) {
    this.nueva.lugar = lugar.nombre;
    this.busquedaLugar = lugar.nombre;
    this.lugaresResultados = [];
  }

  abrirMapa(lugar: LugarResult, event: Event) {
    event.stopPropagation();
    window.open(`https://www.google.com/maps/search/?api=1&query=${lugar.lat},${lugar.lon}`);
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // ── CRUD Citas ───────────────────────────────────────────────────────

  async guardarCita() {
    if (!this.nueva.doctor || !this.nueva.fecha || !this.nueva.hora) {
      this.toast('Doctor, fecha y hora son obligatorios', 'warning');
      return;
    }

    const cita: Cita = { ...this.nueva, creadoEn: new Date().toISOString() } as any;
    const localCitas = this.getLocalCitas();
    const tempId = `local_${Date.now()}`;

    // Intentar Firestore
    try {
      await runInInjectionContext(this.injector, () => {
        const ref = collection(this.firestore, `usuarios/${this.uid}/citas`);
        return addDoc(ref, { ...this.nueva, creadoEn: new Date() });
      });
      // Si Firestore funcionó, el onSnapshot actualizará la lista y localStorage
    } catch (e) {
      // Guardar en localStorage como fallback
      cita.id = tempId;
      localCitas.push(cita);
      this.setLocalCitas(localCitas);
      this.citas = [...localCitas].sort((a, b) => a.fecha.localeCompare(b.fecha));
      console.warn('Cita saved to localStorage (Firestore error):', e);
    }

    this.nueva = { doctor: '', especialidad: '', fecha: '', hora: '', lugar: '', notas: '' };
    this.busquedaLugar = '';
    this.lugaresResultados = [];
    this.mostrarForm = false;
    this.notifService.programarCitas(this.citas);
    this.toast('Cita guardada correctamente', 'success');
  }

  async eliminarCita(cita: Cita) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar cita',
      message: `¿Eliminar cita con ${cita.doctor}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            // Eliminar de localStorage
            const updated = this.getLocalCitas().filter(c => c.id !== cita.id);
            this.setLocalCitas(updated);
            this.citas = updated.sort((a, b) => a.fecha.localeCompare(b.fecha));
            this.notifService.programarCitas(this.citas);

            // Intentar eliminar de Firestore
            if (cita.id && !cita.id.startsWith('local_')) {
              try {
                await runInInjectionContext(this.injector, () =>
                  deleteDoc(doc(this.firestore, `usuarios/${this.uid}/citas/${cita.id}`))
                );
              } catch (e) { console.warn('Firestore delete error:', e); }
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private async toast(msg: string, color: string) {
    const t = await this.toastCtrl.create({ message: msg, duration: 2500, color, position: 'bottom' });
    await t.present();
  }

  volverHome() { this.router.navigate(['/home']); }
}
