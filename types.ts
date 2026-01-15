/**
 * MÓDULO: Definiciones de Tipos y Modelos de Datos (Domain Layer)
 * 
 * PROPÓSITO:
 * Define la estructura de datos central, enumeraciones y contratos de interfaz
 * utilizados en toda la aplicación. Actúa como la fuente de verdad para el
 * tipado estático y las reglas de negocio básicas.
 * 
 * RELACIONES PRINCIPALES:
 * Donor (1) <--- (*) MilkJar (N)
 * MilkJar (N) ---> (1) MilkBatch (Pooling)
 * Receiver (1) <--- (*) AdministrationRecord
 */

// --- ENUMS: Máquinas de Estados y Clasificaciones ---

/**
 * Estado actual de la donadora en el sistema.
 * Determina si puede realizar donaciones o si requiere intervención médica.
 */
export enum DonorStatus {
  ACTIVE = 'Apta',        // Puede donar activamente.
  INACTIVE = 'Inactiva',  // Baja administrativa voluntaria o temporal.
  PENDING = 'Pendiente',  // En proceso de registro, faltan laboratorios o entrevista.
  SUSPENDED = 'Suspendida', // Suspensión médica temporal (ej. medicación, infección).
  REJECTED = 'No Apta'    // Rechazo clínico definitivo (ej. serología positiva).
}

/**
 * Clasificación de la donadora según su relación con el receptor y ubicación.
 */
export enum DonorType {
  HOMOLOGOUS_INTERNAL = 'Homóloga Interna', // Madre del receptor, hospitalizada.
  HOMOLOGOUS_EXTERNAL = 'Homóloga Externa', // Madre del receptor, en domicilio.
  HETEROLOGOUS = 'Heteróloga'               // Donadora altruista para banco general.
}

/**
 * Clasificación biológica de la leche según el tiempo post-parto.
 * Crítico para la asignación nutricional adecuada al receptor.
 */
export enum MilkType {
  COLOSTRUM = 'Calostro',   // 0-7 días.
  TRANSITION = 'Transición',// 7-14 días.
  MATURE = 'Madura'         // >14 días.
}

/**
 * Ciclo de vida del producto (Leche Humana) dentro del sistema.
 * Representa el flujo: Extracción -> Análisis -> Pasteurización -> Almacén -> Distribución.
 */
export enum MilkStatus {
  RAW = 'Cruda',            // Recién extraída, no pasteurizada.
  VERIFIED = 'Verificada',  // Pasó inspección visual y olfativa (Filtro 1).
  TESTING = 'En Análisis',  // En laboratorio físico-químico.
  ANALYZED = 'Analizada',   // Aprobada físico-químicamente, lista para lote.
  PASTEURIZED = 'Pasteurizada', // Proceso Holder completado.
  DISCARDED = 'Descartada', // Eliminada por calidad o caducidad.
  DISTRIBUTED = 'Distribuida', // Enviada a otra unidad médica.
  QUARANTINE = 'En Cuarentena', // Pasteurizada, esperando cultivo microbiológico (48h).
  RELEASED = 'Liberada'     // Apta para consumo humano (Microbiología negativa).
}

export enum CaloricClassification {
  HYPOCALORIC = 'Hipocalórica',
  NORMOCALORIC = 'Normocalórica',
  HYPERCALORIC = 'Hipercalórica'
}

// --- INTERFACES: Entidades de Datos ---

export interface AppNotification {
  id: string;
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  targetView?: string;
}

/**
 * Resultado de pruebas serológicas o bioquímicas.
 * Vital para el dictamen de aptitud de la donadora.
 */
export interface LabResult {
  id: string;
  testName: string; // Ej: VIH, VDRL, Hepatitis B
  category?: 'BIOCHEMISTRY' | 'SEROLOGY'; 
  timing?: {
    before: boolean; // Antes del embarazo
    during: boolean; // Durante embarazo
    after: boolean;  // Puerperio
  };
  result: string; // 'Reactivo', 'No Reactivo' o valor numérico
  resultDate: string;
  isReactive?: boolean; // Flag de seguridad: TRUE bloquea a la donadora automáticamente.
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  reason: string;
  startDate: string;
  endDate?: string;
}

/**
 * ENTIDAD PRINCIPAL: Donadora
 * Contiene toda la información clínica, demográfica y legal.
 */
export interface Donor {
  id: string;
  // --- 1. FICHA DE IDENTIFICACIÓN ---
  folio: string; // Formato 463-24
  expediente: string; // Número de expediente madre
  registrationDate: string; // Fecha de llenado
  fullName: string;
  curp: string;
  birthDate: string;
  age?: number; // Calculado
  bloodGroup?: string; 
  occupation?: string;
  civilStatus?: string;
  religion?: string; 
  address?: string;
  referenceAddress?: string; 
  contactPhone: string;
  hospitalId?: string;

  // --- 2. ANTECEDENTES PERINATALES ---
  perinatalCareInstitution?: string; 
  deliveryDate?: string;
  obstetricEventType?: string; // Parto/Cesárea
  gestationalAge?: number; // weeks (al nacimiento)
  infantAgeWeeks?: number; // Edad lactante actual
  infantHospitalized?: boolean; 
  hospitalizationService?: string; 
  
  preGestationalWeight?: number; // kg
  currentWeight?: number; 
  height?: number; // cm
  bmi?: number; // Calculado: weight / height^2
  
  pregnancyInfections?: boolean; 
  infectionsTrimester?: string; 
  pregnancyComplications?: string; 

  // --- 3. ANTECEDENTES PATOLÓGICOS PERSONALES ---
  risks?: {
    transfusions: boolean;
    tattoos: boolean;
    piercings: boolean;
    acupuncture: boolean;
    needleStick: boolean; // Contacto material punzocortante
    others: boolean;
  };
  // Detailed data for the risks table
  riskDetails?: {
    [key: string]: { specification: string; timeElapsed: string };
  };
  
  habits?: {
    alcohol: boolean;
    tobacco: boolean;
    coffee: boolean;
    drugs: boolean;
  };
  
  // Tratamiento Farmacológico
  takingMedication?: boolean;
  medications?: Medication[];
  pharmacologicalTreatment?: string; // Legacy/Fallback
  
  medicalObservations?: string; 

  // --- 4. ANTECEDENTES GINECO-OBSTÉTRICOS ---
  gynObs?: {
    pregnancies: number; // Gesta
    births: number; // Para
    cSections: number; // Cesáreas
    abortions: number; // Abortos
    sexualPartners: number;
    planningMethod?: string;
    abnormalHistory?: string; 
  };

  // --- CLASIFICACIÓN Y VALIDACIÓN ---
  type: DonorType;
  status: DonorStatus;
  rejectionReason?: string; 
  
  // --- 7. MOTIVO Y TIPO DE DONACIÓN ---
  surplusMilk?: boolean; // Excedente de leche
  donationReason?: string; // Otro motivo
  donorCategory?: 'Interna' | 'Externa' | 'En Casa' | 'Lactario Hospitalario';

  // --- 8. RESPONSABLES ---
  staff?: {
    interviewerName: string;
    elaboratedByName: string;
  };

  // Section 4: Labs (Existing)
  labResults?: LabResult[];
  
  // Section 5: Consent (Existing)
  consentSigned: boolean;
  consentDate?: string;

  // Metadata
  lastDonationDate?: string;
  totalVolumeLiters?: number;
}

export interface TransportData {
  transportTimeMinutes: number;
  isothermicBox: boolean;
  icePacksQty: number; 
  packagingState: 'Integro' | 'Dañado';
  temperatureOnArrival: number;
  receptionTime: string;
  arrivalState: 'Congelada' | 'Refrigerada';
}

/**
 * ENTIDAD: Frasco (Unidad mínima de inventario)
 * Representa una extracción individual de una donadora.
 */
export interface MilkJar {
  id: string;
  folio: string; // e.g., HO-2024-05-27-001
  donorId: string; // FK -> Donor
  donorName: string;
  donorType: DonorType;
  
  volumeMl: number;
  milkType: MilkType;
  extractionDate: string;
  extractionTime: string;
  extractionPlace: 'Lactario' | 'Domicilio' | 'Centro de Acopio';
  receptionTemperature: number;
  
  // Validación de Entrada (Filtro 1)
  clean: boolean;
  sealed: boolean;
  labeled: boolean;
  
  // Logística (Externa)
  transportData?: TransportData;

  status: MilkStatus; // State Machine
  location?: string; 
  
  observations?: string;
  rejectionReason?: string;
  
  // Datos de Análisis (Poblados tras pruebas)
  analysisData?: {
    physical: {
      color: string;
      offFlavor: boolean;
      contamination?: string;
    };
    chemical?: {
      acidityAliquots: [number, number, number];
      acidityAverage: number;
      creamatocrit: number; // Kcal/L
      classification: CaloricClassification;
    };
  };

  history: {
    date: string;
    action: string;
    user: string;
    details?: string;
  }[];
}

export interface StorageLocation {
  equipmentId: string;
  shelf: number;
  position: string; // e.g., "A1", "B2"
}

/**
 * ENTIDAD: Lote (Agrupación de Frascos)
 * Unidad de procesamiento para pasteurización (Pooling).
 */
export interface MilkBatch {
  id: string;
  folio: string; // LP-2024-05-27-001
  
  // Información de Pooling
  donors: { id: string; name: string }[];
  jarIds: string[]; // FKs -> MilkJar[]
  
  type: 'Homóloga' | 'Heteróloga';
  milkType: MilkType; // Debe ser consistente en todos los frascos
  
  volumeTotalMl: number;
  status: MilkStatus; // PASTEURIZED, QUARANTINE, RELEASED, DISCARDED
  
  // Dates
  creationDate: string;
  expirationDate?: string; // Calculada post-pasteurización (6 meses)
  
  // Process Data
  pasteurization?: {
    date: string;
    tempCurve: { time: number; temp: number }[]; 
    responsible: string;
    completed: boolean;
  };
  
  microbiology?: {
    sowingDate: string;
    resultDate?: string;
    result?: 'Negativo' | 'Positivo'; // Positivo = Desecho
    responsible?: string;
  };

  // Inventory & Location
  location?: StorageLocation;
}

// Inventory Specific Types
export interface StorageUnit {
  id: string;
  name: string;
  type: 'Freezer' | 'Refrigerator';
  temperature: number;
  status: 'OK' | 'WARNING' | 'CRITICAL';
  capacity: number; // Total slots
  used: number; // Used slots
  shelves: number;
}

// Receiver & Dosage Types
export interface Prescription {
  volumeTotalPerDay: number; // mL
  frequency: number; // times per day
  volumePerTake: number; // mL (calculated)
  milkTypePreference: 'Homóloga' | 'Heteróloga';
  caloricRequirement: CaloricClassification;
  prescribedBy: string;
  lastUpdate: string;
}

export interface Receiver {
  id: string;
  expediente: string; // File ID (e.g., RN-01)
  fullName: string;
  birthDate: string;
  gestationalAge: number; // weeks
  weightKg: number;
  diagnosis: string;
  location: string; // e.g., "UCIN Cama 4"
  status: 'Estable' | 'Observación' | 'Crítico';
  allergies: string[];
  prescription?: Prescription;
}

/**
 * Registro de administración de leche a un paciente.
 * Crucial para la trazabilidad final y cierre del ciclo.
 */
export interface AdministrationRecord {
  id: string;
  receiverId: string;
  receiverName: string;
  batchId: string;
  batchFolio: string;
  volumePrescribed: number;
  volumeAdministered: number;
  volumeDiscarded: number;
  discardReason?: string;
  timestamp: string;
  responsible: string;
  temperature: number;
  via: 'Oral' | 'Sonda Nasogástrica' | 'Sonda Orogástrica';
}

// Reports Module Types
export interface ReportTemplate {
  id: string;
  title: string;
  category: 'OPERATIVE' | 'CLINICAL' | 'QUALITY' | 'ISEM' | 'ADMIN';
  description: string;
  requiredParams: ('dateRange' | 'hospital' | 'milkType' | 'unit')[];
  formatBase?: string; // e.g. "459-24"
}

export interface ReportConfig {
  startDate: string;
  endDate: string;
  hospitalId?: string;
  milkType?: string;
  unit?: string;
  format: 'PDF' | 'EXCEL' | 'CSV';
}

export interface GeneratedReport {
  id: string;
  templateId: string;
  generatedAt: string;
  data: any; 
  config: ReportConfig;
}

// Users & RBAC Types
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  employeeId?: string;
  hospitalId: string;
  hospitalName?: string;
  roles: string[]; // Role IDs
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  lastLogin?: string;
  twoFactorEnabled: boolean;
  specialPermissions?: string[];
  avatarUrl?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // e.g., 'donors:view', 'jars:create'
  isSystem?: boolean; // Cannot be deleted if true
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole?: string;
  action: string; // e.g., 'create_donor'
  target: string; // e.g., 'Maria Gonzalez'
  module: string;
  details?: string;
  ip?: string;
  status: 'SUCCESS' | 'FAILURE';
}

export interface ChartData {
  name: string;
  value: number;
}

export interface AssistantMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// Dashboard Specific Types
export interface DashboardMetric {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: number;
  trendDirection?: 'up' | 'down' | 'neutral';
  status: 'normal' | 'warning' | 'critical' | 'success';
}

export interface SystemAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  entityId?: string;
  timestamp: string;
  actionLabel?: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  target: string; // e.g., "Frasco HO-001"
  timestamp: string;
  iconType: 'bottle' | 'donor' | 'lab' | 'shipping' | 'user';
}