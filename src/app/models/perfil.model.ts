export interface PerfilMedico {
  nombre: string;
  edad: number;
  tipoSanguineo: string;
  alergias: string[];
  enfermedades: string[];
  contactoEmergenciaNombre: string;
  contactoEmergenciaTelefono: string;
  telefono: string;
}

export interface UsuarioData {
  uid: string;
  nombre: string;
  apellido: string;
  email: string;
  planSalud: string;
  noAfiliado: string;
  fechaNacimiento: string;
  vigente: boolean;
}
