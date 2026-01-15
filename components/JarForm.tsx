import React, { useState, useEffect } from 'react';
import { 
  Search, Thermometer, Calendar, Clock, MapPin, Milk, Save, 
  ArrowRight, CheckCircle2, AlertCircle, Snowflake, Box, AlertTriangle, Truck
} from 'lucide-react';
import { Donor, DonorStatus, MilkJar, MilkStatus, MilkType, DonorType } from '../types';

// Mock active donors for search simulation
const MOCK_ACTIVE_DONORS: Partial<Donor>[] = [
  { id: '1', fullName: 'María González Pérez', curp: 'GOPM900101...', status: DonorStatus.ACTIVE, type: DonorType.HOMOLOGOUS_INTERNAL, donorCategory: 'Interna', consentSigned: true },
  { id: '2', fullName: 'Ana López Martínez', curp: 'LOMA920512...', status: DonorStatus.ACTIVE, type: DonorType.HETEROLOGOUS, donorCategory: 'Externa', consentSigned: true },
  { id: '3', fullName: 'Lucía Hernández Ruiz', curp: 'HERL880920...', status: DonorStatus.INACTIVE, type: DonorType.HOMOLOGOUS_EXTERNAL, donorCategory: 'En Casa', consentSigned: true }, // Inactive
  { id: '4', fullName: 'Sofía Ramirez', curp: 'RAMS950101...', status: DonorStatus.ACTIVE, type: DonorType.HOMOLOGOUS_INTERNAL, donorCategory: 'Interna', consentSigned: false }, // No Consent
];

interface JarFormProps {
  onSuccess: (jar: MilkJar) => void;
  onCancel: () => void;
}

const JarForm: React.FC<JarFormProps> = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState(1);
  const [selectedDonor, setSelectedDonor] = useState<Partial<Donor> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form States
  const [formData, setFormData] = useState({
    volumeMl: 0,
    milkType: MilkType.COLOSTRUM,
    extractionDate: new Date().toISOString().split('T')[0],
    extractionTime: '',
    receptionTime: new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5), // Current time for reception
    extractionPlace: 'Lactario',
    receptionTemperature: 4.0,
    observations: '',
    
    // Integrity Checks
    clean: true,
    sealed: true,
    labeled: true,

    // External Logistics
    arrivalState: 'Refrigerada',
    isothermicBox: true,
    icePacksQty: 0,
    packagingState: 'Integro'
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Filter donors
  const filteredDonors = MOCK_ACTIVE_DONORS.filter(d => 
    d.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.curp?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isExternalFlow = selectedDonor?.donorCategory !== 'Interna' && selectedDonor?.donorCategory !== 'Lactario Hospitalario';

  // --- LOGIC HELPERS ---

  const validateColdChain = (): { valid: boolean, errors: string[] } => {
    const errors: string[] = [];
    
    if (formData.volumeMl <= 0) errors.push("El volumen debe ser mayor a 0 mL.");
    if (!formData.extractionTime) errors.push("Hora de extracción requerida.");

    // Integrity
    if (!formData.clean) errors.push("Frasco sucio o con residuos externos.");
    if (!formData.sealed) errors.push("Envase mal cerrado o sin sello.");
    if (!formData.labeled && isExternalFlow) errors.push("Frasco externo sin etiqueta de origen.");

    // Temperature Check
    if (formData.receptionTemperature > 5 && formData.arrivalState !== 'Congelada') {
      errors.push(`Temperatura de recepción elevada: ${formData.receptionTemperature}°C (Máx 5°C).`);
    }

    if (isExternalFlow) {
      // Transport Time Calculation
      if (formData.extractionDate && formData.extractionTime && formData.receptionTime) {
        // Assume same day for simplified calculation, or check dates
        const extTime = new Date(`${formData.extractionDate}T${formData.extractionTime}`);
        const recTime = new Date(`${formData.extractionDate}T${formData.receptionTime}`); // Using extraction date for reception assumption unless date diff logic added
        const diffMinutes = (recTime.getTime() - extTime.getTime()) / (1000 * 60);
        
        if (diffMinutes > 120 && formData.arrivalState === 'Refrigerada') { // 2 hours limit
           errors.push(`Tiempo de traslado excedido: ${Math.round(diffMinutes)} min (Máx 120 min para refrigerada).`);
        }
      }

      if (!formData.isothermicBox) errors.push("Transporte sin caja isotérmica.");
      
      // Ice Pack Ratio Rule (3L Ice : 1L Milk approx, simplified check)
      const milkLiters = formData.volumeMl / 1000;
      if (formData.icePacksQty < (milkLiters * 2)) { // Less strict rule for demo: 2:1
         // errors.push("Insuficiente gel refrigerante."); // Optional blocking
      }
    }

    return { valid: errors.length === 0, errors };
  };

  useEffect(() => {
    if (step === 2) {
      const { errors } = validateColdChain();
      setValidationErrors(errors);
    }
  }, [formData, step]);

  const handleSelectDonor = (donor: Partial<Donor>) => {
    if (donor.status !== DonorStatus.ACTIVE) return;
    if (!donor.consentSigned) return;
    
    setSelectedDonor(donor);
    
    // Set defaults based on donor type
    const isExt = donor.donorCategory !== 'Interna';
    setFormData(prev => ({
      ...prev,
      extractionPlace: isExt ? 'Domicilio' : 'Lactario',
      extractionTime: isExt ? '' : new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5),
      clean: true, sealed: true, labeled: true // Assume good faith initially
    }));
    
    setStep(2);
  };

  const handleRegister = () => {
    const { valid, errors } = validateColdChain();
    if (!valid) {
      alert("No se puede registrar: " + errors.join("\n"));
      return;
    }

    if (!selectedDonor) return;

    // Generate Smart Folio
    const datePart = new Date().toISOString().split('T')[0].replace(/-/g,'');
    const prefix = selectedDonor.type?.includes('Heteróloga') ? 'HE' : 'HO';
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const folio = `${prefix}${datePart}${randomNum}`;

    // Determine status
    let initialStatus = MilkStatus.RAW;
    if (isExternalFlow) initialStatus = MilkStatus.QUARANTINE; // External usually goes to Quarantine first
    if (selectedDonor.type === DonorType.HETEROLOGOUS) initialStatus = MilkStatus.QUARANTINE; // Always pasteurize heterologous

    const newJar: MilkJar = {
      id: Math.random().toString(36).substr(2, 9),
      folio,
      donorId: selectedDonor.id!,
      donorName: selectedDonor.fullName!,
      donorType: selectedDonor.type!,
      volumeMl: formData.volumeMl,
      milkType: formData.milkType,
      extractionDate: formData.extractionDate,
      extractionTime: formData.extractionTime,
      extractionPlace: formData.extractionPlace as any,
      receptionTemperature: formData.receptionTemperature,
      status: initialStatus,
      observations: formData.observations,
      
      clean: formData.clean,
      sealed: formData.sealed,
      labeled: formData.labeled,

      transportData: isExternalFlow ? {
        transportTimeMinutes: 60, // Mock calc
        isothermicBox: formData.isothermicBox,
        icePacksQty: formData.icePacksQty,
        packagingState: formData.packagingState as any,
        temperatureOnArrival: formData.receptionTemperature,
        receptionTime: formData.receptionTime,
        arrivalState: formData.arrivalState as any
      } : undefined,

      history: [
        {
          date: new Date().toISOString(),
          action: 'Recepción y Registro',
          user: 'Enf. Turno', 
          details: isExternalFlow ? 'Captación Externa - Cadena Frío Verificada' : 'Extracción en Lactario'
        }
      ]
    };

    onSuccess(newJar);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Recepción de Leche Humana</h2>
          <p className="text-xs text-slate-500">Registro normativo de captación y cadena de frío</p>
        </div>
        <div className="flex items-center gap-3">
           <div className={`flex items-center gap-2 text-sm ${step === 1 ? 'font-bold text-pink-600' : 'text-slate-500'}`}>
             <span className="w-6 h-6 rounded-full border flex items-center justify-center">1</span> Donadora
           </div>
           <div className="w-8 h-px bg-slate-300"></div>
           <div className={`flex items-center gap-2 text-sm ${step === 2 ? 'font-bold text-pink-600' : 'text-slate-500'}`}>
             <span className="w-6 h-6 rounded-full border flex items-center justify-center">2</span> Datos y Validación
           </div>
        </div>
        <button onClick={onCancel} className="text-sm font-medium text-slate-500 hover:text-slate-800">Cancelar</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
        
        {/* STEP 1: DONOR SELECTION */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Buscar por Nombre, Folio o CURP..." 
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-pink-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className="max-w-3xl mx-auto grid gap-3">
              {filteredDonors.map(donor => {
                const isBlocked = donor.status !== DonorStatus.ACTIVE || !donor.consentSigned;
                return (
                  <button 
                    key={donor.id}
                    onClick={() => handleSelectDonor(donor)}
                    disabled={isBlocked}
                    className={`relative p-4 border rounded-xl transition-all text-left flex justify-between items-center group w-full
                      ${isBlocked 
                        ? 'bg-slate-50 border-slate-200 opacity-70 cursor-not-allowed' 
                        : 'bg-white border-slate-200 hover:border-pink-500 hover:shadow-md cursor-pointer'}
                    `}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800">{donor.fullName}</p>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${donor.donorCategory === 'Interna' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                          {donor.donorCategory}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-1">CURP: {donor.curp}</p>
                      
                      {isBlocked && (
                        <div className="mt-2 text-xs text-red-600 font-bold flex items-center gap-1">
                          <AlertCircle size={12}/> 
                          {!donor.consentSigned ? 'Consentimiento Pendiente' : 'Donadora Inactiva/Suspendida'}
                        </div>
                      )}
                    </div>
                    {!isBlocked && <ArrowRight className="text-slate-300 group-hover:text-pink-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: DATA ENTRY */}
        {step === 2 && selectedDonor && (
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
            
            {/* Left Column: Form */}
            <div className="lg:col-span-2 space-y-6">
               {/* 2.1 Basic Info */}
               <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Milk size={18} className="text-blue-500"/> Datos del Frasco
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Volumen (mL)</label>
                       <input 
                         type="number" autoFocus
                         value={formData.volumeMl}
                         onChange={(e) => setFormData({...formData, volumeMl: parseFloat(e.target.value)})}
                         className="w-full p-2.5 border border-slate-300 rounded-lg text-lg font-bold"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Tipo de Leche</label>
                       <select 
                         value={formData.milkType}
                         onChange={(e) => setFormData({...formData, milkType: e.target.value as any})}
                         className="w-full p-2.5 border border-slate-300 rounded-lg"
                       >
                         {Object.values(MilkType).map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Fecha Extracción</label>
                       <input 
                         type="date"
                         value={formData.extractionDate}
                         onChange={(e) => setFormData({...formData, extractionDate: e.target.value})}
                         className="w-full p-2.5 border border-slate-300 rounded-lg"
                       />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Hora Extracción</label>
                       <input 
                         type="time"
                         value={formData.extractionTime}
                         onChange={(e) => setFormData({...formData, extractionTime: e.target.value})}
                         className="w-full p-2.5 border border-slate-300 rounded-lg"
                       />
                     </div>
                  </div>
               </div>

               {/* 2.2 Logistics (External Only) */}
               {isExternalFlow && (
                 <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm">
                    <h3 className="font-bold text-blue-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <Truck size={18}/> Logística de Traslado
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div>
                         <label className="block text-xs font-bold text-blue-700 mb-1">Hora Recepción BLH</label>
                         <input 
                           type="time"
                           value={formData.receptionTime}
                           onChange={(e) => setFormData({...formData, receptionTime: e.target.value})}
                           className="w-full p-2 border border-blue-200 rounded-lg bg-white"
                         />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-blue-700 mb-1">Estado al Arribo</label>
                         <select
                           value={formData.arrivalState}
                           onChange={(e) => setFormData({...formData, arrivalState: e.target.value as any})}
                           className="w-full p-2 border border-blue-200 rounded-lg bg-white"
                         >
                           <option value="Refrigerada">Refrigerada</option>
                           <option value="Congelada">Congelada</option>
                         </select>
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-blue-700 mb-1">Geles Refrig. (Unidades)</label>
                         <input 
                           type="number"
                           value={formData.icePacksQty}
                           onChange={(e) => setFormData({...formData, icePacksQty: parseInt(e.target.value)})}
                           className="w-full p-2 border border-blue-200 rounded-lg bg-white"
                         />
                       </div>
                       <div className="md:col-span-3 flex gap-6 pt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.isothermicBox} onChange={e => setFormData({...formData, isothermicBox: e.target.checked})} className="w-4 h-4 text-blue-600 rounded"/>
                            <span className="text-sm font-medium text-blue-800">Uso de Caja Isotérmica</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.packagingState === 'Integro'} onChange={e => setFormData({...formData, packagingState: e.target.checked ? 'Integro' : 'Dañado'})} className="w-4 h-4 text-blue-600 rounded"/>
                            <span className="text-sm font-medium text-blue-800">Embalaje Íntegro</span>
                          </label>
                       </div>
                    </div>
                 </div>
               )}

               {/* 2.3 Verification */}
               <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <CheckCircle2 size={18} className="text-emerald-500"/> Verificación de Ingreso
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Temperatura Frasco (°C)</label>
                       <div className="relative">
                         <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                         <input 
                           type="number" step="0.1"
                           value={formData.receptionTemperature}
                           onChange={(e) => setFormData({...formData, receptionTemperature: parseFloat(e.target.value)})}
                           className={`w-full pl-9 pr-4 py-2 border rounded-lg font-bold ${formData.receptionTemperature > 5 ? 'text-red-600 border-red-200 bg-red-50' : 'text-emerald-600 border-emerald-200 bg-emerald-50'}`}
                         />
                       </div>
                     </div>
                     <div className="flex flex-col gap-2 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100">
                          <input type="checkbox" checked={formData.clean} onChange={e => setFormData({...formData, clean: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded"/>
                          <span className="text-sm text-slate-700">Frasco Limpio / Sin Residuos</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100">
                          <input type="checkbox" checked={formData.sealed} onChange={e => setFormData({...formData, sealed: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded"/>
                          <span className="text-sm text-slate-700">Envase Sellado / Íntegro</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100">
                          <input type="checkbox" checked={formData.labeled} onChange={e => setFormData({...formData, labeled: e.target.checked})} className="w-4 h-4 text-emerald-600 rounded"/>
                          <span className="text-sm text-slate-700">Correctamente Etiquetado</span>
                        </label>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right Column: Status Summary */}
            <div className="space-y-6">
               <div className="bg-slate-800 text-white p-5 rounded-xl shadow-lg">
                  <h4 className="text-xs font-bold uppercase opacity-70 mb-2">Resumen de Recepción</h4>
                  <div className="space-y-3">
                     <div>
                       <span className="block text-xs opacity-60">Donadora</span>
                       <span className="font-bold">{selectedDonor.fullName}</span>
                     </div>
                     <div>
                       <span className="block text-xs opacity-60">Tipo de Donación</span>
                       <span className="font-bold text-emerald-400">{selectedDonor.type}</span>
                     </div>
                     <div>
                       <span className="block text-xs opacity-60">Flujo Operativo</span>
                       <span className="font-bold">{isExternalFlow ? 'Externo (Ruta/Acopio)' : 'Interno (Lactario)'}</span>
                     </div>
                  </div>
               </div>

               {/* Validation Status */}
               <div className={`p-5 rounded-xl border ${validationErrors.length > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                  {validationErrors.length > 0 ? (
                    <>
                      <h4 className="font-bold text-red-800 flex items-center gap-2 mb-2">
                        <AlertTriangle size={18}/> Bloqueos de Registro
                      </h4>
                      <ul className="space-y-1">
                        {validationErrors.map((err, i) => (
                          <li key={i} className="text-xs text-red-700 flex items-start gap-1">
                            <span className="mt-0.5">•</span> {err}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <>
                      <h4 className="font-bold text-emerald-800 flex items-center gap-2 mb-2">
                        <CheckCircle2 size={18}/> Apto para Ingreso
                      </h4>
                      <p className="text-xs text-emerald-700">Todos los criterios normativos y de cadena de frío se cumplen.</p>
                      
                      <div className="mt-4 pt-3 border-t border-emerald-200">
                         <p className="text-xs font-bold text-emerald-800 uppercase mb-1">Destino Inicial Asignado:</p>
                         {isExternalFlow || selectedDonor.type === DonorType.HETEROLOGOUS ? (
                           <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                             Cuarentena / Pasteurización
                           </span>
                         ) : (
                           <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                             Leche Cruda (Uso Directo)
                           </span>
                         )}
                      </div>
                    </>
                  )}
               </div>
            </div>

          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
        {step === 2 ? (
          <button onClick={() => setStep(1)} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">
            Atrás
          </button>
        ) : <div/>}
        
        {step === 2 && (
          <button 
            onClick={handleRegister}
            disabled={validationErrors.length > 0}
            className="px-8 py-2 bg-pink-600 text-white font-bold hover:bg-pink-700 rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            Registrar Frasco
          </button>
        )}
      </div>
    </div>
  );
};

export default JarForm;