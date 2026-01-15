export enum DonorStatus {
  ACTIVE = 'Apta',
  INACTIVE = 'Inactiva',
  PENDING = 'Pendiente',
  SUSPENDED = 'Suspendida', // Medical or temp suspension
  REJECTED = 'No Apta' // Clinical rejection
}

export enum DonorType {
  HOMOLOGOUS_INTERNAL = 'Homóloga Interna',
  HOMOLOGOUS_EXTERNAL = 'Homóloga Externa',
  HETEROLOGOUS = 'Heteróloga'
}

export enum MilkType {
  COLOSTRUM = 'Calostro',
  TRANSITION = 'Transición',
  MATURE = 'Madura'
}

export enum MilkStatus {
  RAW = 'Cruda',
  VERIFIED = 'Verificada', // Physically verified
  TESTING = 'En Análisis', // In Physico-chemical analysis
  ANALYZED = 'Analizada', // Passed Physico-chemical, ready for batching
  PASTEURIZED = 'Pasteurizada',
  DISCARDED = 'Descartada',
  DISTRIBUTED = 'Distribuida',
  QUARANTINE = 'En Cuarentena',
  RELEASED = 'Liberada'
}

export enum CaloricClassification {
  HYPOCALORIC = 'Hipocalórica',
  NORMOCALORIC = 'Normocalórica',
  HYPERCALORIC = 'Hipercalórica'
}

export interface LabResult {
  id: string;
  testName: string;
  category?: 'BIOCHEMISTRY' | 'SEROLOGY'; // New category for grouping
  timing?: {
    before: boolean;
    during: boolean;
    after: boolean;
  };
  result: string; // 'Reactivo', 'No Reactivo' or numeric value as string
  resultDate: string;
  isReactive?: boolean; // Helper for UI alerts
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

export interface Donor {
  id: string;
  // --- 1. FICHA DE IDENTIFICACIÓN ---
  folio: string; // Formato 463-24
  expediente: string; // Número de expediente madre
  registrationDate: string; // Fecha de llenado
  fullName: string;
  curp: string;
  birthDate: string;
  age?: number; // Calculated
  bloodGroup?: string; // New: Grupo Sanguíneo
  occupation?: string;
  civilStatus?: string;
  religion?: string; // New
  address?: string;
  referenceAddress?: string; // New: Referencias domicilio
  contactPhone: string;
  hospitalId?: string;

  // --- 2. ANTECEDENTES PERINATALES ---
  perinatalCareInstitution?: string; // New
  deliveryDate?: string;
  obstetricEventType?: string; // New: Tipo de evento (Parto/Cesárea/etc)
  gestationalAge?: number; // weeks (al nacimiento)
  infantAgeWeeks?: number; // New: Edad lactante actual
  infantHospitalized?: boolean; // New
  hospitalizationService?: string; // New
  
  preGestationalWeight?: number; // kg
  currentWeight?: number; // New
  height?: number; // cm
  bmi?: number; // Calculated
  
  pregnancyInfections?: boolean; // New
  infectionsTrimester?: string; // New
  pregnancyComplications?: string; // New

  // --- 3. ANTECEDENTES PATOLÓGICOS PERSONALES (New Section) ---
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
  
  // Medication Treatment
  takingMedication?: boolean;
  medications?: Medication[];
  pharmacologicalTreatment?: string; // Legacy/Fallback
  
  medicalObservations?: string; // General observations for section 3

  // --- 4. ANTECEDENTES GINECO-OBSTÉTRICOS (New Section) ---
  gynObs?: {
    pregnancies: number; // Gesta
    births: number; // Para
    cSections: number; // Cesáreas
    abortions: number; // Abortos
    sexualPartners: number;
    planningMethod?: string;
    abnormalHistory?: string; // Antecedentes anormales (Si/No especificar)
  };

  // --- CLASIFICACIÓN Y VALIDACIÓN ---
  type: DonorType;
  status: DonorStatus;
  rejectionReason?: string; // Motivo no aceptación
  
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
  icePacksQty: number; // Liters/Units estimate
  packagingState: 'Integro' | 'Dañado';
  temperatureOnArrival: number;
  receptionTime: string;
  arrivalState: 'Congelada' | 'Refrigerada';
}

export interface MilkJar {
  id: string;
  folio: string; // e.g., HO-2024-05-27-001
  donorId: string;
  donorName: string;
  donorType: DonorType;
  
  volumeMl: number;
  milkType: MilkType;
  extractionDate: string;
  extractionTime: string;
  extractionPlace: 'Lactario' | 'Domicilio' | 'Centro de Acopio';
  receptionTemperature: number;
  
  // Entry Validation
  clean: boolean;
  sealed: boolean;
  labeled: boolean;
  
  // Logistics (External)
  transportData?: TransportData;

  status: MilkStatus;
  location?: string; // Text description or ID
  
  observations?: string;
  rejectionReason?: string;
  
  // Analysis Data (Optional, populated after analysis)
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

export interface MilkBatch {
  id: string;
  folio: string; // LP-2024-05-27-001
  
  // Pooling Info
  donors: { id: string; name: string }[];
  jarIds: string[];
  
  type: 'Homóloga' | 'Heteróloga';
  milkType: MilkType;
  
  volumeTotalMl: number;
  status: MilkStatus; // PASTEURIZED, QUARANTINE, RELEASED, DISCARDED
  
  // Dates
  creationDate: string;
  expirationDate?: string;
  
  // Process Data
  pasteurization?: {
    date: string;
    tempCurve: { time: number; temp: number }[]; // For charts: 0min, 5min, ... 30min
    responsible: string;
    completed: boolean;
  };
  
  microbiology?: {
    sowingDate: string;
    resultDate?: string;
    result?: 'Negativo' | 'Positivo';
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