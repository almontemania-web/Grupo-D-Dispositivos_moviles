export interface RecetaMedRegistro {
  nombre: string;
  dosis: string;
  frecuencia: string;
  categoria: string;
  agregado: boolean;
}

export interface RecetaRegistro {
  id?: string;
  fecha: any;
  medicamentos: RecetaMedRegistro[];
  totalDetectados: number;
  totalAgregados: number;
}
