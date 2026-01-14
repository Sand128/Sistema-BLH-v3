import React, { useState } from 'react';
import { Search, Thermometer, Calendar, Clock, MapPin, Milk, Save, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Donor, DonorStatus, MilkJar, MilkStatus, MilkType } from '../types';

// Should be passed as prop or fetched, using mock for standalone
const MOCK_ACTIVE_DONORS: Partial<Donor>[] = [
  { id: '1', fullName: 'María González Pérez', curp: 'GOPM900101...', status: DonorStatus.ACTIVE, type: 'Homóloga Interna' as any },
  { id: '3', fullName: 'Lucía Hernández Ruiz', curp: 'HERL880920...', status: DonorStatus.ACTIVE, type: 'Homóloga Externa' as any },
];

interface JarFormProps {
  onSuccess: (jar: MilkJar) => void;
  onCancel: () => void;
}

const JarForm: React.FC<JarFormProps> = ({ onSuccess, onCancel }) => {
  const [step, setStep] = useState(1);
  const [selectedDonor, setSelectedDonor] = useState<Partial<Donor> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [extractionData, setExtractionData] = useState({
    volumeMl: 50,
    milkType: MilkType.COLOSTRUM,
    extractionDate: new Date().toISOString().split('T')[0],
    extractionTime: new Date().toLocaleTimeString('en-GB', { hour12: false }).slice(0, 5),
    extractionPlace: 'Lactario',
    receptionTemperature: 4.0,
    observations: ''
  });

  // Filter donors
  const filteredDonors = MOCK_ACTIVE_DONORS.filter(d => 
    d.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.curp?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectDonor = (donor: Partial<Donor>) => {
    setSelectedDonor(donor);
    setStep(2);
  };

  const handleRegister = () => {
    if (!selectedDonor) return;

    // Generate Mock Folio
    const datePart = new Date().toISOString().split('T')[0];
    const prefix = selectedDonor.type?.includes('Heteróloga') ? 'HE' : 'HO';
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const folio = `${prefix}-${datePart}-${randomNum}`;

    const newJar: MilkJar = {
      id: Math.random().toString(36).substr(2, 9),
      folio,
      donorId: selectedDonor.id!,
      donorName: selectedDonor.fullName!,
      donorType: selectedDonor.type!,
      volumeMl: extractionData.volumeMl,
      milkType: extractionData.milkType,
      extractionDate: extractionData.extractionDate,
      extractionTime: extractionData.extractionTime,
      extractionPlace: extractionData.extractionPlace as any,
      receptionTemperature: extractionData.receptionTemperature,
      status: MilkStatus.RAW,
      observations: extractionData.observations,
      history: [
        {
          date: new Date().toISOString(),
          action: 'Registro Inicial',
          user: 'Enf. Actual', // Mock user
          details: 'Ingreso al sistema'
        }
      ]
    };

    onSuccess(newJar);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Registrar Extracción</h2>
          <div className="flex items-center gap-2 mt-1">
             <span className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-pink-500' : 'bg-slate-300'}`}></span>
             <span className={`h-0.5 w-8 ${step >= 2 ? 'bg-pink-500' : 'bg-slate-200'}`}></span>
             <span className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-pink-500' : 'bg-slate-300'}`}></span>
             <span className={`h-0.5 w-8 ${step >= 3 ? 'bg-pink-500' : 'bg-slate-200'}`}></span>
             <span className={`h-2 w-2 rounded-full ${step >= 3 ? 'bg-pink-500' : 'bg-slate-300'}`}></span>
          </div>
        </div>
        <button onClick={onCancel} className="text-sm font-medium text-slate-500 hover:text-slate-800">
          Cancelar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        
        {/* STEP 1: DONOR SELECTION */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">Paso 1: Identificar Donadora</h3>
              <p className="text-slate-500 text-sm">Busque y seleccione la donadora activa</p>
            </div>

            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder="Nombre o CURP..." 
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-pink-500 outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className="max-w-2xl mx-auto grid gap-3">
              {filteredDonors.map(donor => (
                <button 
                  key={donor.id}
                  onClick={() => handleSelectDonor(donor)}
                  className="bg-white p-4 border border-slate-200 rounded-xl hover:border-pink-500 hover:shadow-md transition-all text-left flex justify-between items-center group"
                >
                  <div>
                    <p className="font-bold text-slate-800 group-hover:text-pink-600 transition-colors">{donor.fullName}</p>
                    <p className="text-xs text-slate-500 font-mono mt-1">CURP: {donor.curp}</p>
                    <div className="flex gap-2 mt-2">
                       <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">✅ Apta</span>
                       <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{donor.type}</span>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-300 group-hover:text-pink-500" />
                </button>
              ))}
              {filteredDonors.length === 0 && (
                <p className="text-center text-slate-400 py-8">No se encontraron donadoras activas.</p>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: EXTRACTION DATA */}
        {step === 2 && selectedDonor && (
          <div className="space-y-6 max-w-2xl mx-auto animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
               <div>
                 <p className="text-xs text-slate-500 uppercase font-bold">Donadora Seleccionada</p>
                 <p className="font-bold text-slate-800">{selectedDonor.fullName}</p>
               </div>
               <button onClick={() => setStep(1)} className="text-xs text-pink-600 hover:underline">Cambiar</button>
            </div>

            <h3 className="text-lg font-bold text-slate-800 pb-2 border-b border-slate-100">Datos de Extracción</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                    <Milk size={16} /> Volumen (mL)
                 </label>
                 <input 
                   type="number" 
                   value={extractionData.volumeMl}
                   onChange={(e) => setExtractionData({...extractionData, volumeMl: parseFloat(e.target.value)})}
                   className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 font-bold text-lg"
                 />
                 {extractionData.volumeMl > 150 && (
                   <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                     <AlertCircle size={12}/> Sugerencia: Dividir en dos frascos
                   </p>
                 )}
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Leche</label>
                 <select 
                   value={extractionData.milkType}
                   onChange={(e) => setExtractionData({...extractionData, milkType: e.target.value as MilkType})}
                   className="w-full p-2.5 border border-slate-300 rounded-lg"
                 >
                   {Object.values(MilkType).map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                   <Calendar size={16} /> Fecha
                 </label>
                 <input 
                   type="date"
                   value={extractionData.extractionDate}
                   onChange={(e) => setExtractionData({...extractionData, extractionDate: e.target.value})}
                   className="w-full p-2.5 border border-slate-300 rounded-lg"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                   <Clock size={16} /> Hora
                 </label>
                 <input 
                   type="time"
                   value={extractionData.extractionTime}
                   onChange={(e) => setExtractionData({...extractionData, extractionTime: e.target.value})}
                   className="w-full p-2.5 border border-slate-300 rounded-lg"
                 />
               </div>
               
               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                   <MapPin size={16} /> Lugar
                 </label>
                 <select
                   value={extractionData.extractionPlace}
                   onChange={(e) => setExtractionData({...extractionData, extractionPlace: e.target.value as any})}
                   className="w-full p-2.5 border border-slate-300 rounded-lg"
                 >
                   <option value="Lactario">Lactario Hospital</option>
                   <option value="Domicilio">Domicilio</option>
                   <option value="Centro de Acopio">Centro de Acopio</option>
                 </select>
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                   <Thermometer size={16} /> Temp. Recepción (°C)
                 </label>
                 <input 
                   type="number"
                   step="0.1"
                   value={extractionData.receptionTemperature}
                   onChange={(e) => setExtractionData({...extractionData, receptionTemperature: parseFloat(e.target.value)})}
                   className={`w-full p-2.5 border rounded-lg font-bold ${
                     extractionData.receptionTemperature > 5 
                       ? 'border-orange-300 bg-orange-50 text-orange-700' 
                       : 'border-slate-300'
                   }`}
                 />
               </div>

               <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
                 <textarea 
                   value={extractionData.observations}
                   onChange={(e) => setExtractionData({...extractionData, observations: e.target.value})}
                   className="w-full p-2.5 border border-slate-300 rounded-lg"
                   rows={2}
                 />
               </div>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRMATION (Implicit in "Registrar") */}
      </div>

      <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3">
        {step === 2 && (
          <button 
            onClick={() => setStep(1)}
            className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
          >
            Atrás
          </button>
        )}
        
        {step === 2 && (
          <button 
            onClick={handleRegister}
            className="px-8 py-2 bg-pink-600 text-white font-bold hover:bg-pink-700 rounded-lg shadow-md flex items-center gap-2"
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