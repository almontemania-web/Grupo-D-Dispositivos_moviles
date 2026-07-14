import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MedicamentosService } from '../../services/medicamentos.service';
import {
  IonContent, IonIcon, IonInput, IonItem, IonSelect,
  IonSelectOption, ToastController, LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, addOutline, timeOutline, trashOutline,
  medkitOutline, searchOutline
} from 'ionicons/icons';

interface MedDB {
  nombre: string;
  descripcion: string;
  categoria: string;
  dosis: string;
  frecuencia: string;
}

const MEDICAMENTOS_DB: MedDB[] = [
  // ── Cardiovascular ────────────────────────────────────────────────────
  { nombre: 'Losartán',          dosis: '50mg',      categoria: 'cardiovascular', frecuencia: '24h',
    descripcion: 'Antihipertensivo. Trata la presión arterial alta y protege los riñones en diabéticos.' },
  { nombre: 'Atenolol',          dosis: '50mg',      categoria: 'cardiovascular', frecuencia: '24h',
    descripcion: 'Beta-bloqueante. Trata la hipertensión, angina e irregularidades del ritmo cardíaco.' },
  { nombre: 'Amlodipino',        dosis: '5mg',       categoria: 'cardiovascular', frecuencia: '24h',
    descripcion: 'Bloqueador de calcio. Trata la hipertensión arterial y la angina de pecho.' },
  { nombre: 'Metoprolol',        dosis: '50mg',      categoria: 'cardiovascular', frecuencia: '12h',
    descripcion: 'Beta-bloqueante. Trata la hipertensión y angina; se toma dos veces al día.' },
  { nombre: 'Enalapril',         dosis: '10mg',      categoria: 'cardiovascular', frecuencia: '12h',
    descripcion: 'Inhibidor ECA. Trata la hipertensión arterial y la insuficiencia cardíaca.' },
  { nombre: 'Ramipril',          dosis: '5mg',       categoria: 'cardiovascular', frecuencia: '24h',
    descripcion: 'Inhibidor ECA. Trata la hipertensión y reduce el riesgo de eventos cardiovasculares.' },
  { nombre: 'Hidroclorotiazida', dosis: '25mg',      categoria: 'cardiovascular', frecuencia: '24h',
    descripcion: 'Diurético tiazídico. Trata la hipertensión y reduce la retención de líquidos.' },
  { nombre: 'Furosemida',        dosis: '40mg',      categoria: 'cardiovascular', frecuencia: '24h',
    descripcion: 'Diurético de asa. Elimina el exceso de líquido en insuficiencia cardíaca y edemas.' },
  { nombre: 'Simvastatina',      dosis: '20mg',      categoria: 'cardiovascular', frecuencia: '24h',
    descripcion: 'Estatina. Reduce el colesterol y los triglicéridos. Se toma preferiblemente por la noche.' },
  { nombre: 'Atorvastatina',     dosis: '20mg',      categoria: 'cardiovascular', frecuencia: '24h',
    descripcion: 'Estatina. Reduce el colesterol LDL y el riesgo de enfermedades cardiovasculares.' },
  { nombre: 'Warfarina',         dosis: '5mg',       categoria: 'cardiovascular', frecuencia: '24h',
    descripcion: 'Anticoagulante. Previene la formación de coágulos sanguíneos peligrosos.' },
  { nombre: 'Aspirina',          dosis: '100mg',     categoria: 'cardiovascular', frecuencia: '24h',
    descripcion: 'Antiagregante plaquetario. Previene infartos y accidentes cerebrovasculares.' },
  { nombre: 'Carvedilol',        dosis: '6.25mg',    categoria: 'cardiovascular', frecuencia: '12h',
    descripcion: 'Beta-bloqueante. Trata la insuficiencia cardíaca y la hipertensión; se toma dos veces al día.' },
  // ── Diabetes ─────────────────────────────────────────────────────────
  { nombre: 'Metformina',        dosis: '500mg',     categoria: 'diabetes', frecuencia: '8h',
    descripcion: 'Antidiabético de primera línea. Controla el azúcar en sangre en diabetes tipo 2; se toma con las comidas.' },
  { nombre: 'Glibenclamida',     dosis: '5mg',       categoria: 'diabetes', frecuencia: '12h',
    descripcion: 'Sulfonilurea. Estimula el páncreas para producir más insulina en diabetes tipo 2.' },
  { nombre: 'Glimepirida',       dosis: '2mg',       categoria: 'diabetes', frecuencia: '24h',
    descripcion: 'Antidiabético oral. Disminuye el azúcar en sangre; se toma una vez al día con el desayuno.' },
  { nombre: 'Sitagliptina',      dosis: '100mg',     categoria: 'diabetes', frecuencia: '24h',
    descripcion: 'Inhibidor DPP-4. Ayuda a regular la insulina según los niveles de glucosa; una vez al día.' },
  { nombre: 'Insulina NPH',      dosis: '10-20 UI',  categoria: 'diabetes', frecuencia: '12h',
    descripcion: 'Insulina de acción intermedia. Controla el azúcar en sangre durante 8 a 16 horas; dos dosis al día.' },
  { nombre: 'Insulina Glargina', dosis: '10-20 UI',  categoria: 'diabetes', frecuencia: '24h',
    descripcion: 'Insulina basal de acción prolongada. Mantiene el azúcar controlada durante las 24 horas.' },
  { nombre: 'Empagliflozina',    dosis: '10mg',      categoria: 'diabetes', frecuencia: '24h',
    descripcion: 'Inhibidor SGLT-2. Reduce el azúcar eliminándola por la orina; protege el riñón y el corazón.' },
  // ── Dolor / Inflamación ───────────────────────────────────────────────
  { nombre: 'Ibuprofeno',        dosis: '400mg',     categoria: 'dolor', frecuencia: '8h',
    descripcion: 'Antiinflamatorio (AINE). Alivia el dolor, la fiebre y la inflamación; cada 8 horas con alimentos.' },
  { nombre: 'Paracetamol',       dosis: '500mg',     categoria: 'dolor', frecuencia: '8h',
    descripcion: 'Analgésico y antipirético. Alivia el dolor y reduce la fiebre; puede tomarse cada 6-8 horas.' },
  { nombre: 'Diclofenaco',       dosis: '50mg',      categoria: 'dolor', frecuencia: '8h',
    descripcion: 'Antiinflamatorio. Trata el dolor musculoesquelético, articular y cólico menstrual; cada 8 horas.' },
  { nombre: 'Naproxeno',         dosis: '250mg',     categoria: 'dolor', frecuencia: '12h',
    descripcion: 'Antiinflamatorio. Alivia el dolor de artritis, espalda baja y cólico menstrual; cada 12 horas.' },
  { nombre: 'Tramadol',          dosis: '50mg',      categoria: 'dolor', frecuencia: '8h',
    descripcion: 'Analgésico opiáceo. Trata el dolor moderado a severo cuando otros analgésicos no son suficientes.' },
  { nombre: 'Celecoxib',         dosis: '200mg',     categoria: 'dolor', frecuencia: '12h',
    descripcion: 'Antiinflamatorio COX-2. Trata la artritis con menor riesgo gástrico; una o dos veces al día.' },
  { nombre: 'Ketorolaco',        dosis: '10mg',      categoria: 'dolor', frecuencia: '8h',
    descripcion: 'Antiinflamatorio potente de corto plazo. Alivia el dolor agudo y postoperatorio; cada 6-8 horas.' },
  { nombre: 'Meloxicam',         dosis: '7.5mg',     categoria: 'dolor', frecuencia: '24h',
    descripcion: 'Antiinflamatorio. Trata la osteoartritis y artritis reumatoide; una sola dosis al día.' },
  // ── Antibióticos ──────────────────────────────────────────────────────
  { nombre: 'Amoxicilina',       dosis: '500mg',     categoria: 'otro', frecuencia: '8h',
    descripcion: 'Antibiótico penicilínico. Trata infecciones del tracto respiratorio, urinario, oído y piel; cada 8 horas.' },
  { nombre: 'Azitromicina',      dosis: '500mg',     categoria: 'otro', frecuencia: '24h',
    descripcion: 'Macrólido. Trata infecciones respiratorias, de oído y piel; una dosis diaria por 3-5 días.' },
  { nombre: 'Ciprofloxacino',    dosis: '500mg',     categoria: 'otro', frecuencia: '12h',
    descripcion: 'Quinolona. Trata infecciones urinarias, intestinales y algunas respiratorias; cada 12 horas.' },
  { nombre: 'Claritromicina',    dosis: '500mg',     categoria: 'otro', frecuencia: '12h',
    descripcion: 'Macrólido. Trata infecciones respiratorias y úlcera gástrica por H. pylori; cada 12 horas.' },
  { nombre: 'Metronidazol',      dosis: '500mg',     categoria: 'otro', frecuencia: '8h',
    descripcion: 'Antibiótico y antiparasitario. Trata infecciones por bacterias anaerobias y parásitos intestinales; cada 8 horas.' },
  { nombre: 'Fluconazol',        dosis: '150mg',     categoria: 'otro', frecuencia: '24h',
    descripcion: 'Antimicótico. Trata la candidiasis oral, vaginal y otras infecciones por hongos; dosis única o semanal.' },
  // ── Gastrointestinal ──────────────────────────────────────────────────
  { nombre: 'Omeprazol',         dosis: '20mg',      categoria: 'otro', frecuencia: '24h',
    descripcion: 'Inhibidor de bomba de protones. Reduce el ácido estomacal; trata gastritis, úlceras y reflujo. Tomar en ayunas.' },
  { nombre: 'Lansoprazol',       dosis: '30mg',      categoria: 'otro', frecuencia: '24h',
    descripcion: 'Inhibidor de bomba de protones. Trata el reflujo gastroesofágico y las úlceras gástricas. Tomar antes del desayuno.' },
  { nombre: 'Pantoprazol',       dosis: '40mg',      categoria: 'otro', frecuencia: '24h',
    descripcion: 'Inhibidor de bomba de protones. Trata la acidez, gastritis y esofagitis erosiva. Tomar en ayunas.' },
  { nombre: 'Metoclopramida',    dosis: '10mg',      categoria: 'otro', frecuencia: '8h',
    descripcion: 'Procinético. Trata las náuseas, vómitos y sensación de llenura; se toma 30 minutos antes de las comidas.' },
  { nombre: 'Loperamida',        dosis: '2mg',       categoria: 'otro', frecuencia: '8h',
    descripcion: 'Antidiarreico. Reduce la frecuencia de evacuaciones y alivia los cólicos en la diarrea.' },
  // ── Respiratorio / Alérgicos ──────────────────────────────────────────
  { nombre: 'Salbutamol',        dosis: '100mcg',    categoria: 'otro', frecuencia: '8h',
    descripcion: 'Broncodilatador de acción rápida (inhalador). Alivia los ataques de asma y el broncoespasmo.' },
  { nombre: 'Montelukast',       dosis: '10mg',      categoria: 'otro', frecuencia: '24h',
    descripcion: 'Antileucotrieno. Previene los síntomas del asma y trata la rinitis alérgica; se toma por la noche.' },
  { nombre: 'Loratadina',        dosis: '10mg',      categoria: 'otro', frecuencia: '24h',
    descripcion: 'Antihistamínico no sedante. Alivia la rinitis alérgica, urticaria y otras alergias; una dosis al día.' },
  { nombre: 'Cetirizina',        dosis: '10mg',      categoria: 'otro', frecuencia: '24h',
    descripcion: 'Antihistamínico. Alivia los síntomas de alergias, fiebre del heno y urticaria crónica; una dosis al día.' },
  { nombre: 'Prednisona',        dosis: '5mg',       categoria: 'otro', frecuencia: '24h',
    descripcion: 'Corticoesteroide. Trata inflamaciones severas, alergias graves y enfermedades autoinmunes; con el desayuno.' },
  { nombre: 'Dexametasona',      dosis: '4mg',       categoria: 'otro', frecuencia: '12h',
    descripcion: 'Corticoesteroide potente. Trata inflamaciones, edemas y alergias graves; generalmente cada 12 horas.' },
  // ── Tiroides / Sistema nervioso ───────────────────────────────────────
  { nombre: 'Levotiroxina',      dosis: '50mcg',     categoria: 'otro', frecuencia: '24h',
    descripcion: 'Hormona tiroidea sintética. Trata el hipotiroidismo. Tomar en ayunas, 30 min antes del desayuno.' },
  { nombre: 'Alprazolam',        dosis: '0.25mg',    categoria: 'otro', frecuencia: '8h',
    descripcion: 'Ansiolítico (benzodiacepina). Trata la ansiedad y los ataques de pánico; dos a tres veces al día.' },
  { nombre: 'Clonazepam',        dosis: '0.5mg',     categoria: 'otro', frecuencia: '12h',
    descripcion: 'Antiepiléptico y ansiolítico. Trata la epilepsia, el trastorno de pánico y la ansiedad; cada 12 horas.' },
  { nombre: 'Sertralina',        dosis: '50mg',      categoria: 'otro', frecuencia: '24h',
    descripcion: 'Antidepresivo ISRS. Trata la depresión, el pánico, la ansiedad social y el TOC; una dosis al día.' },
  { nombre: 'Fluoxetina',        dosis: '20mg',      categoria: 'otro', frecuencia: '24h',
    descripcion: 'Antidepresivo ISRS. Trata la depresión y el trastorno obsesivo-compulsivo; una dosis por la mañana.' },
  // ── Vitaminas / Suplementos ───────────────────────────────────────────
  { nombre: 'Vitamina C',           dosis: '500mg',   categoria: 'vitaminas', frecuencia: '24h',
    descripcion: 'Antioxidante esencial. Fortalece el sistema inmune y favorece la cicatrización de heridas.' },
  { nombre: 'Vitamina D3',          dosis: '1000 UI', categoria: 'vitaminas', frecuencia: '24h',
    descripcion: 'Vitamina esencial. Favorece la absorción de calcio, fortalece huesos e inmunidad.' },
  { nombre: 'Ácido Fólico',         dosis: '400mcg',  categoria: 'vitaminas', frecuencia: '24h',
    descripcion: 'Vitamina B9. Esencial en el embarazo para prevenir defectos del tubo neural del bebé.' },
  { nombre: 'Vitamina B12',         dosis: '500mcg',  categoria: 'vitaminas', frecuencia: '24h',
    descripcion: 'Cobalamina. Mantiene la salud nerviosa y la producción adecuada de glóbulos rojos.' },
  { nombre: 'Calcio + Vitamina D',  dosis: '600mg',   categoria: 'vitaminas', frecuencia: '12h',
    descripcion: 'Suplemento mineral. Fortalece huesos y dientes, previene la osteoporosis; dos tomas al día.' },
  { nombre: 'Hierro',               dosis: '325mg',   categoria: 'vitaminas', frecuencia: '24h',
    descripcion: 'Mineral esencial. Trata y previene la anemia ferropénica. Tomar con vitamina C para mejor absorción.' },
  { nombre: 'Zinc',                 dosis: '50mg',    categoria: 'vitaminas', frecuencia: '24h',
    descripcion: 'Oligoelemento esencial. Fortalece el sistema inmune y favorece la cicatrización.' },
  { nombre: 'Magnesio',             dosis: '400mg',   categoria: 'vitaminas', frecuencia: '24h',
    descripcion: 'Mineral esencial. Regula la función muscular y nerviosa, reduce calambres y fatiga.' },
  { nombre: 'Omega 3',              dosis: '1000mg',  categoria: 'vitaminas', frecuencia: '24h',
    descripcion: 'Ácidos grasos esenciales. Reduce los triglicéridos y apoya la salud cardiovascular.' },
];

@Component({
  selector: 'app-agregar-medicamento',
  templateUrl: './agregar-medicamento.page.html',
  styleUrls: ['./agregar-medicamento.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon,
    IonInput, IonItem, IonSelect, IonSelectOption]
})
export class AgregarMedicamentoPage {
  private medService = inject(MedicamentosService);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);

  nombre = '';
  dosis = '';
  categoria = 'otro';
  frecuencia = '12h';
  duracionDias = 30;
  horarios: string[] = ['08:00'];
  nuevoHorario = '';
  notas = '';

  sugerencias: MedDB[] = [];

  categorias = [
    { valor: 'cardiovascular', label: 'Cardiovascular' },
    { valor: 'diabetes', label: 'Diabetes' },
    { valor: 'dolor', label: 'Dolor / Inflamación' },
    { valor: 'vitaminas', label: 'Vitaminas / Suplementos' },
    { valor: 'otro', label: 'Otro' }
  ];

  frecuencias = [
    { valor: '8h',      label: 'Cada 8 horas (3 veces al día)' },
    { valor: '12h',     label: 'Cada 12 horas (2 veces al día)' },
    { valor: '24h',     label: 'Una vez al día' },
    { valor: 'semanal', label: 'Semanal' }
  ];

  constructor() {
    addIcons({ arrowBackOutline, addOutline, timeOutline, trashOutline, medkitOutline, searchOutline });
  }

  filtrarMedicamentos() {
    const q = this.nombre.trim().toLowerCase();
    if (q.length < 1) { this.sugerencias = []; return; }
    this.sugerencias = MEDICAMENTOS_DB.filter(m =>
      m.nombre.toLowerCase().includes(q)
    ).slice(0, 8);
  }

  seleccionarMed(m: MedDB) {
    this.nombre    = m.nombre;
    this.dosis     = m.dosis;
    this.categoria = m.categoria;
    this.frecuencia = m.frecuencia;
    this.horarios  = this.generarHorarios(m.frecuencia);
    this.notas     = m.descripcion;
    this.sugerencias = [];
  }

  private generarHorarios(frecuencia: string): string[] {
    switch (frecuencia) {
      case '8h':      return ['08:00', '14:00', '22:00'];
      case '12h':     return ['08:00', '20:00'];
      case '24h':     return ['08:00'];
      case 'semanal': return ['08:00'];
      default:        return ['08:00'];
    }
  }

  ocultarSugerencias() {
    setTimeout(() => { this.sugerencias = []; }, 200);
  }

  agregarHorario() {
    if (this.nuevoHorario && !this.horarios.includes(this.nuevoHorario)) {
      this.horarios.push(this.nuevoHorario);
      this.nuevoHorario = '';
    }
  }

  eliminarHorario(h: string) {
    this.horarios = this.horarios.filter(x => x !== h);
  }

  async guardar() {
    if (!this.nombre || !this.dosis || this.horarios.length === 0) {
      const toast = await this.toastCtrl.create({
        message: 'Completa nombre, dosis y al menos un horario',
        duration: 2500, color: 'warning'
      });
      await toast.present();
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Guardando...' });
    await loading.present();

    const medicamento = {
      nombre: this.nombre,
      dosis: this.dosis,
      categoria: this.categoria,
      frecuencia: this.frecuencia,
      horarios: this.horarios,
      duracionDias: this.duracionDias,
      notas: this.notas,
      activo: true
    };

    try {
      await this.medService.agregarMedicamento(medicamento as any);
      await loading.dismiss();
      const toast = await this.toastCtrl.create({
        message: `${this.nombre} agregado correctamente`,
        duration: 2500, color: 'success'
      });
      await toast.present();
    } catch (e) {
      await loading.dismiss();
      const toast = await this.toastCtrl.create({
        message: 'Error al guardar. Verifica tu conexión.',
        duration: 2500, color: 'danger'
      });
      await toast.present();
    }
    this.router.navigate(['/medicamentos'], { replaceUrl: true });
  }

  volver() { this.router.navigate(['/medicamentos']); }
}
