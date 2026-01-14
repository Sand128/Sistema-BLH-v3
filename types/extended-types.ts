import { Donor } from '../types';

// Extensión del tipo Donor existente para incluir metadata de consentimiento
export interface DonorExtended extends Donor {
  // Campos adicionales para consentimiento
  fechaConsentimiento?: string;
  firmaDigitalUrl?: string;
  testigoConsentimiento?: string;
  vigenciaConsentimiento?: string;
  
  // Campos adicionales para laboratorios (preparación para paso 2)
  labExpirationDate?: string;
  requiereRenovacionLab?: boolean;
}

// Tipo para el formulario de consentimiento
export interface ConsentimientoFormData {
  donadoraId: string;
  donadoraNombre: string;
  fechaFirma: string;
  testigoNombre: string;
  testigoCargo: string;
  unidadMedica: string;
  firmaDigital: File | null;
  aceptaTerminos: boolean;
  informacionCompleta: boolean;
  voluntario: boolean;
  puedeRevocar: boolean;
}

// Tipo para respuesta del servicio
export interface ConsentimientoResponse {
  id: string;
  donadoraId: string;
  pdfUrl: string;
  firmaUrl: string;
  fechaRegistro: string;
  validoHasta: string; // 6 meses después
  estado: 'VIGENTE' | 'VENCIDO' | 'REVOCADO';
}