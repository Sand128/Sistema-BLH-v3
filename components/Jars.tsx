import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Save, Clock, Droplet, User, 
  CheckCircle2, AlertTriangle, Thermometer, 
  MapPin, Calendar, Milk, ArrowRight, Filter
} from 'lucide-react';
import { MilkJar, MilkStatus, MilkType, DonorType, DonorStatus, Donor } from '../types';

// --- MOCK DATA ---
const MOCK_DONORS: Partial<Donor>[] = [
  { id: '1', fullName: 'María González Pérez', curp: 'GOPM900101...', status: DonorStatus.ACTIVE, type: DonorType.HOMOLOGOUS_INTERNAL, donorCategory: 'Interna', consentSigned: true },
  { id: '2', fullName: 'Ana López Martínez', curp: 'LOMA920512...', status: DonorStatus.ACTIVE, type: DonorType.HETEROLOGOUS, donorCategory: 'Externa', consentSigned: true },
  { id: '3', fullName: 'Lucía Hernández Ruiz', curp: 'HERL880920...', status: DonorStatus.INACTIVE, type: DonorType.HOMOLOGOUS_EXTERNAL, donorCategory: 'En Casa', consentSigned: true },
  { id: '4', fullName: 'Sofía Ramirez', curp: 'RAMS950101...', status: DonorStatus.ACTIVE, type: DonorType.HOMOLOGOUS_INTERNAL, donorCategory: 'Lactario Hospitalario', consentSigned: false },
  { id: '5', fullName: 'Carmen Vega', curp: 'VEGC880101...', status: DonorStatus.ACTIVE, type: DonorType.HETEROLOGOUS, donorCategory: 'Externa', consentSigned: true },
];

const INITIAL_JARS: MilkJar[] = [
  { 
    id: '1', folio: 'HO-2024-05-27-001', donorId: '1', donorName: 'María González Pérez', donorType: DonorType.HOMOLOGOUS_INTERNAL,
    volumeMl: 50, milkType: MilkType.COLOSTRUM, extractionDate: new Date().toISOString().split('T')[0], extractionTime: '08:30', extractionPlace: 'Lactario',
    receptionTemperature: 4.2, status: MilkStatus.RAW, history: [], clean: true, sealed: true, labeled: true
  },
  { 
    id: '2', folio: 'HO-2024-05-27-002', donorId: '2', donorName: 'Ana López Martínez', donorType: DonorType.HETEROLOGOUS,
    volumeMl: 120, milkType: MilkType.MATURE, extractionDate: new Date().toISOString().split('T')[0], extractionTime: '09:15', extractionPlace: 'Domicilio',
    receptionTemperature: 5.0, status: MilkStatus.RAW, history: [], clean: true, sealed: true, labeled: true
  }
];

const Jars: React.FC = () => {
  // State
  const [jars, setJars] = useState<MilkJar[]>(INITIAL_JARS);
  const [selectedDonor, setSelectedDonor] = useState<Partial<Donor> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    volumeMl: '',
    milkType: MilkType.MATURE,
    extractionDate: new Date().toISOString().split('T')[0],
    extractionTime: '',
    receptionTemperature: '',
    clean: true,
    sealed: true,
    labeled: true
  });

  // --- LOGIC ---

  // Filter donors for right column
  const filteredDonors = useMemo(() => {
    return MOCK_DONORS.filter(d => 
      d.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.curp?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Today's summary data
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysJars = jars.filter(j => j.extractionDate === todayStr || j.history[0]?.date.startsWith(todayStr)); // Simplified date check
  const totalVolumeToday = todaysJars.reduce((acc, j) => acc + j.volumeMl, 0);

  const handleSelectDonor = (donor: Partial<Donor>) => {
    if (donor.status !== DonorStatus.ACTIVE || !donor.consentSigned) return;
    
    setSelectedDonor(donor);
    setNotification(null);
    
    // Auto-fill defaults based on donor type
    const isInternal = donor.donorCategory === 'Interna' || donor.donorCategory === 'Lactario Hospitalario';
    setFormData({
      volumeMl: '',
      milkType: MilkType.MATURE,
      extractionDate: todayStr,
      extractionTime: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      receptionTemperature: isInternal ? '4.0' : '',
      clean: true,
      sealed: true,
      labeled: true
    });
  };

  const handleSave = () => {
    // 1. Validations
    if (!formData.volumeMl || parseFloat(formData.volumeMl) <= 0) {
      setNotification({ type: 'error', message: 'El volumen debe ser mayor a 0.' });
      return;
    }
    if (!formData.extractionTime) {
      setNotification({ type: 'error', message: 'La hora de extracción es obligatoria.' });
      return;
    }
    if (!formData.receptionTemperature) {
      setNotification({ type: 'error', message: 'La temperatura es obligatoria.' });
      return;
    }

    // 2. Create Object
    const newJar: MilkJar = {
      id: Math.random().toString(36).substr(2, 9),
      folio: `N-${Math.floor(Math.random() * 10000)}`, // Simple mock folio
      donorId: selectedDonor!.id!,
      donorName: selectedDonor!.fullName!,
      donorType: selectedDonor!.type!,
      volumeMl: parseFloat(formData.volumeMl),
      milkType: formData.milkType,
      extractionDate: formData.extractionDate,
      extractionTime: formData.extractionTime,
      extractionPlace: (selectedDonor?.donorCategory === 'Interna') ? 'Lactario' : 'Domicilio',
      receptionTemperature: parseFloat(formData.receptionTemperature),
      status: MilkStatus.RAW,
      clean: formData.clean,
      sealed: formData.sealed,
      labeled: formData.labeled,
      history: [{ date: new Date().toISOString(), action: 'Registro', user: 'Usuario Actual' }]
    };

    // 3. Save (Mock)
    setJars([newJar, ...jars]);
    
    // 4. Feedback & Reset
    setNotification({ type: 'success', message: 'El frasco se guardó correctamente.' });
    setSelectedDonor(null); // Return to "Select Donor" state to force verification of identity for next jar
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isInternalDonor = selectedDonor?.donorCategory === 'Interna' || selectedDonor?.donorCategory === 'Lactario Hospitalario';

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6">
      
      {/* --- LEFT COLUMN: SUMMARY & FORM (66%) --- */}
      <div className="flex-1 lg:basis-2/3 flex flex-col gap-6 overflow-y-auto pr-2">
        
        {/* 1. DAILY SUMMARY CARD */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-shrink-0">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={18} className="text-pink-600"/> Resumen del Día
              </h3>
              <p className="text-xs text-slate-500 capitalize">{new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase font-bold">Total Hoy</p>
              <p className="text-xl font-bold text-blue-600">{(totalVolumeToday / 1000).toFixed(2)} L</p>
            </div>
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {todaysJars.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No hay frascos registrados hoy.
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 sticky top-0">
                  <tr>
                    <th className="px-6 py-2 font-medium">Hora</th>
                    <th className="px-6 py-2 font-medium">Folio</th>
                    <th className="px-6 py-2 font-medium">Donadora</th>
                    <th className="px-6 py-2 font-medium text-right">Volumen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todaysJars.map(jar => (
                    <tr key={jar.id} className="hover:bg-slate-50">
                      <td className="px-6 py-2 text-slate-500 font-mono text-xs">{jar.extractionTime}</td>
                      <td className="px-6 py-2 font-medium text-slate-700">{jar.folio}</td>
                      <td className="px-6 py-2 text-slate-600 truncate max-w-[200px]">{jar.donorName}</td>
                      <td className="px-6 py-2 text-right font-bold text-blue-600">{jar.volumeMl} ml</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* 2. REGISTRATION FORM */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Plus size={18} className="text-pink-600"/> Nuevo Registro de Frasco
            </h3>
          </div>

          {!selectedDonor ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 bg-slate-50/50">
              <Search size={48} className="mb-4 text-slate-300"/>
              <p className="text-lg font-medium text-slate-600">Seleccione una donadora</p>
              <p className="text-sm">Utilice el listado de la derecha para comenzar el registro.</p>
            </div>
          ) : (
            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
              
              {/* Feedback Message */}
              {notification && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {notification.type === 'success' ? <CheckCircle2 size={20}/> : <AlertTriangle size={20}/>}
                  <span className="font-medium">{notification.message}</span>
                </div>
              )}

              {/* Selected Donor Card */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase mb-1">Donadora Seleccionada</p>
                  <h4 className="text-lg font-bold text-slate-800">{selectedDonor.fullName}</h4>
                  <div className="flex gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded border ${isInternalDonor ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}>
                      {selectedDonor.donorCategory}
                    </span>
                    <span className="text-xs text-slate-500 font-mono pt-0.5">{selectedDonor.curp}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedDonor(null)} className="text-sm text-pink-600 hover:underline">
                  Cambiar
                </button>
              </div>

              {/* Specific Guidelines */}
              <div className={`text-sm p-3 rounded border flex gap-3 ${isInternalDonor ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
                {isInternalDonor ? (
                  <>
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5"/>
                    <p><strong>Protocolo Interno:</strong> Verifique higiene de manos y mamas antes de recibir. Asegure etiquetado inmediato.</p>
                  </>
                ) : (
                  <>
                    <Thermometer size={18} className="shrink-0 mt-0.5"/>
                    <p><strong>Protocolo Externo:</strong> Verifique temperatura de hielera, estado de geles congelantes y tiempo de transporte.</p>
                  </>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Volumen (ml) *</label>
                  <div className="relative">
                    <Droplet className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input 
                      type="number" 
                      autoFocus
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none text-lg font-bold"
                      placeholder="0"
                      value={formData.volumeMl}
                      onChange={e => setFormData({...formData, volumeMl: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Tipo de Leche</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none bg-white"
                    value={formData.milkType}
                    onChange={e => setFormData({...formData, milkType: e.target.value as any})}
                  >
                    {Object.values(MilkType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Hora Extracción *</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input 
                      type="time" 
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                      value={formData.extractionTime}
                      onChange={e => setFormData({...formData, extractionTime: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Temperatura Recepción (°C) *</label>
                  <div className="relative">
                    <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/>
                    <input 
                      type="number" 
                      step="0.1"
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                      placeholder="Ej: 4.0"
                      value={formData.receptionTemperature}
                      onChange={e => setFormData({...formData, receptionTemperature: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Integrity Checks */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Verificación Física</label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded border border-slate-200 hover:border-pink-300 transition-colors">
                    <input type="checkbox" checked={formData.clean} onChange={e => setFormData({...formData, clean: e.target.checked})} className="w-4 h-4 text-pink-600 rounded"/>
                    <span className="text-sm">Frasco Limpio</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded border border-slate-200 hover:border-pink-300 transition-colors">
                    <input type="checkbox" checked={formData.sealed} onChange={e => setFormData({...formData, sealed: e.target.checked})} className="w-4 h-4 text-pink-600 rounded"/>
                    <span className="text-sm">Bien Sellado</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded border border-slate-200 hover:border-pink-300 transition-colors">
                    <input type="checkbox" checked={formData.labeled} onChange={e => setFormData({...formData, labeled: e.target.checked})} className="w-4 h-4 text-pink-600 rounded"/>
                    <span className="text-sm">Etiquetado</span>
                  </label>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={handleSave}
                  className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                >
                  <Save size={20} />
                  Guardar Frasco
                </button>
              </div>

            </div>
          )}
        </section>
      </div>

      {/* --- RIGHT COLUMN: DONOR LIST (33%) --- */}
      <div className="flex-1 lg:basis-1/3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-800 mb-3">Listado de Donadoras</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o CURP..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 mt-2">
             <button className="text-xs flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 hover:bg-slate-100">
               <Filter size={12}/> Activas
             </button>
             <button className="text-xs flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded text-slate-600 hover:bg-slate-100">
               <MapPin size={12}/> Internas
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredDonors.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-sm">
              No se encontraron donadoras.
            </div>
          ) : (
            filteredDonors.map(donor => {
              const isDisabled = donor.status !== DonorStatus.ACTIVE || !donor.consentSigned;
              return (
                <div 
                  key={donor.id}
                  onClick={() => !isDisabled && handleSelectDonor(donor)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer group
                    ${selectedDonor?.id === donor.id 
                      ? 'bg-pink-50 border-pink-300 ring-1 ring-pink-300' 
                      : isDisabled
                        ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed'
                        : 'bg-white border-slate-200 hover:border-pink-300 hover:shadow-sm'}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className={`text-sm font-bold ${selectedDonor?.id === donor.id ? 'text-pink-800' : 'text-slate-800'}`}>
                        {donor.fullName}
                      </p>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{donor.curp}</p>
                    </div>
                    {isDisabled && <AlertTriangle size={14} className="text-amber-500" title="Inactiva o sin consentimiento"/>}
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      donor.donorCategory === 'Interna' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-orange-50 text-orange-700 border-orange-100'
                    }`}>
                      {donor.donorCategory}
                    </span>
                    {!isDisabled && (
                      <ArrowRight size={14} className={`transform transition-transform ${selectedDonor?.id === donor.id ? 'text-pink-600 translate-x-1' : 'text-slate-300 group-hover:text-pink-400'}`} />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};

export default Jars;