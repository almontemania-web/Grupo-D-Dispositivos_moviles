export interface Medicamento {
  id?: string;
  nombre: string;
  dosis: string;
  frecuencia: string;
  horarios: string[];
  duracionDias: number;
  activo: boolean;
  categoria: string;
  notas?: string;
  creadoEn?: any;
}
