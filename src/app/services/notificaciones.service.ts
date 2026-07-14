import { Injectable } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';

// Rangos de IDs para evitar colisiones
const ID_MEDS_START  = 1;     // 1–899  → medicamentos (diarios)
const ID_CITA_1DIA   = 900;   // 900–949 → recordatorio 1 día antes
const ID_CITA_2H     = 950;   // 950–999 → alarma 2 horas antes

@Injectable({ providedIn: 'root' })
export class NotificacionesService {

  // ── Permisos ────────────────────────────────────────────────────────
  async solicitarPermiso(): Promise<boolean> {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch { return false; }
  }

  // ── Medicamentos — alarma diaria en cada horario ────────────────────
  async programarMedicamentos(medicamentos: any[]) {
    const ok = await this.solicitarPermiso();
    if (!ok) return;

    await this.cancelarRango(ID_MEDS_START, ID_CITA_1DIA - 1);

    const notifs: any[] = [];
    let id = ID_MEDS_START;
    const ahora = new Date();

    for (const med of medicamentos) {
      if (!med.activo) continue;
      for (const hora of (med.horarios as string[] || [])) {
        if (id >= ID_CITA_1DIA) break;
        const [h, m] = hora.split(':').map(Number);
        const at = new Date();
        at.setHours(h, m, 0, 0);
        if (at <= ahora) at.setDate(at.getDate() + 1);

        notifs.push({
          id: id++,
          title: `Medicamento: ${med.nombre}`,
          body: `Dosis: ${med.dosis}${med.notas ? ' — ' + med.notas.substring(0, 50) : ''}`,
          schedule: { at, repeats: true, every: 'day' },
          sound: undefined,
          smallIcon: 'ic_stat_medicalert',
          actionTypeId: '',
          extra: { tipo: 'medicamento', nombre: med.nombre }
        });
      }
    }

    if (notifs.length > 0) {
      try { await LocalNotifications.schedule({ notifications: notifs }); }
      catch (e) { console.warn('programarMedicamentos error:', e); }
    }
  }

  // ── Citas — recordatorio 1 día antes + alarma 2 horas antes ─────────
  async programarCitas(citas: any[]) {
    const ok = await this.solicitarPermiso();
    if (!ok) return;

    await this.cancelarRango(ID_CITA_1DIA, 999);

    const notifs: any[] = [];
    let id1dia = ID_CITA_1DIA;
    let id2h   = ID_CITA_2H;
    const ahora = new Date();

    for (const cita of citas) {
      if (!cita.fecha || !cita.hora) continue;
      if (id1dia >= ID_CITA_2H || id2h >= 1000) break;

      const [horaNum, minNum] = cita.hora.split(':').map(Number);
      const fechaCita = new Date(cita.fecha + 'T00:00:00');
      fechaCita.setHours(horaNum, minNum, 0, 0);

      if (fechaCita <= ahora) continue; // cita ya pasó

      const doctor   = `Dr. ${cita.doctor}`;
      const espec    = cita.especialidad ? ` · ${cita.especialidad}` : '';
      const lugar    = cita.lugar        ? ` en ${cita.lugar}`       : '';
      const horaStr  = cita.hora;

      // ── Recordatorio 24 horas antes ──
      const at1dia = new Date(fechaCita);
      at1dia.setDate(at1dia.getDate() - 1);
      if (at1dia > ahora && id1dia < ID_CITA_2H) {
        notifs.push({
          id: id1dia++,
          title: 'Cita médica mañana',
          body: `${doctor}${espec} — mañana a las ${horaStr}${lugar}`,
          schedule: { at: at1dia },
          sound: undefined,
          smallIcon: 'ic_stat_medicalert',
          actionTypeId: '',
          extra: { tipo: 'cita_1dia' }
        });
      }

      // ── Alarma 2 horas antes ──
      const at2h = new Date(fechaCita);
      at2h.setHours(at2h.getHours() - 2);
      if (at2h > ahora && id2h < 1000) {
        notifs.push({
          id: id2h++,
          title: 'Tu cita es en 2 horas',
          body: `${doctor}${espec} a las ${horaStr}${lugar}`,
          schedule: { at: at2h },
          sound: undefined,
          smallIcon: 'ic_stat_medicalert',
          actionTypeId: '',
          extra: { tipo: 'cita_2h' }
        });
      }
    }

    if (notifs.length > 0) {
      try { await LocalNotifications.schedule({ notifications: notifs }); }
      catch (e) { console.warn('programarCitas error:', e); }
    }
  }

  // ── Helpers ─────────────────────────────────────────────────────────
  private async cancelarRango(desde: number, hasta: number) {
    try {
      const pending = await LocalNotifications.getPending();
      const toCancel = pending.notifications.filter(n => n.id >= desde && n.id <= hasta);
      if (toCancel.length > 0) await LocalNotifications.cancel({ notifications: toCancel });
    } catch (e) { console.warn('cancelarRango error:', e); }
  }

  async cancelarTodas() {
    try {
      const p = await LocalNotifications.getPending();
      if (p.notifications.length > 0) await LocalNotifications.cancel(p);
    } catch (e) { console.warn('cancelarTodas error:', e); }
  }
}
