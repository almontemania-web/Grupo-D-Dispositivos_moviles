import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HistorialService, HistorialItem } from '../../services/historial.service';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, checkmarkCircleOutline, closeCircleOutline,
  timeOutline, medkitOutline, calendarOutline, heartOutline,
  documentTextOutline, refreshOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon]
})
export class HistorialPage implements OnInit {
  private historialService = inject(HistorialService);
  private router = inject(Router);

  historial: HistorialItem[] = [];
  cargando = true;

  get totalMeds(): number    { return this.historial.filter(h => h.tipo === 'medicamento').length; }
  get totalCitas(): number   { return this.historial.filter(h => h.tipo === 'cita').length; }
  get totalTomas(): number   { return this.historial.filter(h => h.tipo === 'toma' && h.tomado).length; }

  constructor() {
    addIcons({
      arrowBackOutline, checkmarkCircleOutline, closeCircleOutline,
      timeOutline, medkitOutline, calendarOutline, heartOutline,
      documentTextOutline, refreshOutline
    });
  }

  ngOnInit() {
    this.historialService.getHistorial().subscribe(data => {
      this.historial = data;
      this.cargando = false;
    });
  }

  getIcono(item: HistorialItem): string {
    if (item.tipo === 'medicamento') return 'medkit-outline';
    if (item.tipo === 'cita')        return 'calendar-outline';
    return item.tomado ? 'checkmark-circle-outline' : 'close-circle-outline';
  }

  getColor(item: HistorialItem): string {
    if (item.tipo === 'medicamento') return '#4CAF50';
    if (item.tipo === 'cita')        return '#2196F3';
    return item.tomado ? '#4CAF50' : '#D32F2F';
  }

  getTipoLabel(tipo: string): string {
    return ({ medicamento: 'Medicamento', cita: 'Cita médica', toma: 'Toma' } as any)[tipo] || tipo;
  }

  getFecha(f: string): string {
    try {
      return new Date(f).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return f; }
  }

  getHora(f: string): string {
    try {
      return new Date(f).toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  }

  refrescar() {
    this.historial = this.historialService.refreshHistorial();
  }

  volverHome() { this.router.navigate(['/home']); }
}
