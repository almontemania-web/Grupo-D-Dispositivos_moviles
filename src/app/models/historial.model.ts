export interface HistorialItem {
  id: string;
  tipo: 'medicamento' | 'cita' | 'toma';
  titulo: string;
  descripcion: string;
  fecha: string;
  tomado?: boolean;
}
