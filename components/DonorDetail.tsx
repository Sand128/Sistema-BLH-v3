import React, { useState } from 'react';
import { 
  ArrowLeft, Edit, FileText, MapPin, Milk, Calendar, 
  ChevronRight, User, Activity, Phone, Plus, Printer, 
  Save, X, Droplet, ExternalLink, FileSignature, AlertCircle, Download, Building, QrCode, Beaker, Clock
} from 'lucide-react';
import { Donor, DonorStatus, MilkType, MilkJar, MilkStatus, DonorType } from '../types';
import { ConsentimientoModal } from './consentimiento/ConsentimientoModal';
import { ConsentimientoStatus } from './consentimiento/ConsentimientoStatus';
import { HOSPITAL_CATALOG } from '../constants/catalogs';
import { useNotifications } from '../context/NotificationContext';

interface DonorDetailProps {
  donor: Donor;
  onBack: () => void;
  onEdit: () => void;
}

type TabType = 'general' | 'clinical' | 'contact' | 'history';

const DonorDetail: React.FC<DonorDetailProps> = ({ donor, onBack, onEdit }) => {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [showNewDonationForm, setShowNewDonationForm] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [localConsentSigned, setLocalConsentSigned] = useState(donor.consentSigned);

  // Form State for New Donation
  const [formValues, setFormValues] = useState({
    hospital: HOSPITAL_CATALOG[0].options[0],
    milkType: MilkType.MATURE,
    date: new Date().toISOString().split('T')[0],
    volume: '',
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  });

  // History State (Initialized with Mock Data)
  const [history, setHistory] = useState([
    { id: 'HO09A26003', date: '09/01/2026', time: '09:30', vol: 150, status: 'Lote Asignado', type: 'Madura', batchId: 'LP-24-001' },
    { id: 'HO09A26002', date: '08/01/2026', time: '14:15', vol: 120, status: 'En Análisis', type: 'Madura', batchId: null },
    { id: 'HO09A26001', date: '05/01/2026', time: '08:00', vol: 80, status: 'Verificada', type: 'Transición', batchId: null },
    { id: 'HO09A25099', date: '02/01/2026', time: '10:45', vol: 110, status: 'Cruda', type: 'Transición', batchId: null },
  ]);

  const handleSaveJar = () => {
    if (!formValues.volume || parseInt(formValues.volume) <= 0) {
      alert("Por favor ingrese un volumen válido");
      return;
    }

    // 1. Generate ID/Folio
    const datePart = formValues.date.replace(/-/g, '').slice(2); // YYMMDD
    const randomSeq = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const newFolio = `HO${datePart}${randomSeq}`;

    // 2. Create the MilkJar object for Global State (LocalStorage simulation)
    const newJar: MilkJar = {
      id: Date.now().toString(),
      folio: newFolio,
      donorId: donor.id,
      donorName: donor.fullName,
      donorType: donor.type,
      volumeMl: parseInt(formValues.volume),
      milkType: formValues.milkType,
      extractionDate: formValues.date,
      extractionTime: formValues.time,
      extractionPlace: 'Lactario', // Default based on form context
      receptionTemperature: 4.0, // Default ideal
      status: MilkStatus.RAW,
      clean: true,
      sealed: true,
      labeled: true,
      history: [{ date: new Date().toISOString(), action: 'Registro desde Perfil', user: 'Admin' }]
    };

    // 3. Save to LocalStorage (Simulating Database for Jars Module)
    const existingJars = JSON.parse(localStorage.getItem('app_jars') || '[]');
    localStorage.setItem('app_jars', JSON.stringify([newJar, ...existingJars]));

    // 4. Update Local History View
    const newHistoryItem = {
      id: newFolio,
      date: new Date(formValues.date).toLocaleDateString('es-MX'),
      time: formValues.time,
      vol: parseInt(formValues.volume),
      status: 'Cruda',
      type: formValues.milkType,
      batchId: null
    };

    setHistory([newHistoryItem, ...history]);
    addNotification(`Frasco ${newFolio} guardado correctamente`, 'success', 'jars');
    
    // 5. Reset and Close
    setShowNewDonationForm(false);
    setActiveTab('history');
    setFormValues({ ...formValues, volume: '' }); // Reset volume
  };

  const getStatusBadge = (status: DonorStatus) => {
    switch (status) {
      case DonorStatus.ACTIVE: 
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-600 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Activa</span>;
      case DonorStatus.PENDING: 
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-600 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Pendiente</span>;
      case DonorStatus.REJECTED:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> No Apta</span>;
      default: 
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  const getTimelineStatusColor = (status: string) => {
    switch (status) {
      case 'Lote Asignado': return 'bg-emerald-500 border-emerald-100 ring-emerald-100';
      case 'En Análisis': return 'bg-amber-500 border-amber-100 ring-amber-100';
      case 'Verificada': return 'bg-blue-500 border-blue-100 ring-blue-100';
      default: return 'bg-slate-300 border-slate-100 ring-slate-100';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans text-slate-800">
      
      {/* --- HEADER CARD --- */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-xl font-bold border-4 border-white shadow-sm">
              {getInitials(donor.fullName)}
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{donor.fullName}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {getStatusBadge(donor.status)}
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200 font-mono">
                Folio: {donor.folio}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                Exp: {donor.expediente}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={onEdit} className="flex-1 md:flex-none px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2 transition-colors">
            <Edit size={16} /> Actualizar
          </button>
          
          {localConsentSigned ? (
             <button className="flex-1 md:flex-none px-4 py-2.5 border border-blue-100 text-blue-600 bg-blue-50 font-semibold text-sm rounded-xl hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors">
               <FileText size={16} /> Consentimiento
             </button>
          ) : (
             <button onClick={() => setShowConsentModal(true)} className="flex-1 md:flex-none px-4 py-2.5 border border-blue-200 text-white bg-blue-600 font-semibold text-sm rounded-xl hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2 animate-pulse transition-colors">
               <FileSignature size={16} /> Consentimiento
             </button>
          )}

          <button 
            onClick={() => setShowNewDonationForm(true)}
            disabled={!localConsentSigned || showNewDonationForm}
            className={`flex-1 md:flex-none px-5 py-2.5 font-semibold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors ${localConsentSigned && !showNewDonationForm ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
          >
            <Plus size={18} /> Nueva Donación
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT MENU */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden py-2">
            <nav className="flex flex-col">
              {[
                { id: 'general', label: 'Datos Generales', icon: User },
                { id: 'clinical', label: 'Información Clínica', icon: Activity },
                { id: 'contact', label: 'Contacto y Ubicación', icon: MapPin },
                { id: 'history', label: 'Historial de Donaciones', icon: Milk },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as TabType);
                    setShowNewDonationForm(false);
                  }}
                  className={`relative px-6 py-4 flex items-center gap-3 text-sm font-medium transition-all ${activeTab === item.id && !showNewDonationForm ? 'text-pink-600 bg-pink-50/50' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {activeTab === item.id && !showNewDonationForm && <div className="absolute left-0 top-0 bottom-0 w-1 bg-pink-500 rounded-r-full"></div>}
                  <item.icon size={18} className={activeTab === item.id && !showNewDonationForm ? 'text-pink-500' : 'text-slate-400'} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* TOTAL DONATED WIDGET */}
          <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-6 text-white shadow-lg text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Droplet size={80} />
            </div>
            <div className="relative z-10">
              <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/30 shadow-inner">
                <Droplet size={24} fill="currentColor" />
              </div>
              <p className="text-pink-100 text-sm font-medium mb-1">Total Donado</p>
              <h3 className="text-3xl font-bold tracking-tight">{donor.totalVolumeLiters || 0.45} <span className="text-lg font-normal opacity-80">L</span></h3>
              <p className="text-xs text-pink-200 mt-3 opacity-80 border-t border-white/20 pt-2">
                Gracias a su apoyo
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="lg:col-span-3">
          
          {/* --- VIEW: NEW DONATION FORM (Replaces Tab Content) --- */}
          {showNewDonationForm ? (
            <div className="bg-slate-50 rounded-2xl border border-pink-100 shadow-sm p-6 relative overflow-hidden animate-in fade-in slide-in-from-right-4 h-full">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200">
                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                    <Plus size={24} className="bg-pink-600 text-white p-1 rounded-lg shadow-sm"/> Registro de Nuevo Frasco
                  </h4>
                  <p className="text-sm text-slate-500 mt-1 ml-1">Complete los datos de la extracción</p>
                </div>
                <button onClick={() => setShowNewDonationForm(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2">
                  <X size={18}/> Cancelar
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <div className="lg:col-span-2">
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hospital de Origen</label>
                   <div className="relative">
                     <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                     <select 
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none text-sm appearance-none transition-all"
                        value={formValues.hospital}
                        onChange={(e) => setFormValues({...formValues, hospital: e.target.value})}
                     >
                       {HOSPITAL_CATALOG.map((group, i) => (
                         <optgroup key={i} label={group.category}>
                           {group.options.map(h => <option key={h} value={h}>{h}</option>)}
                         </optgroup>
                       ))}
                     </select>
                   </div>
                 </div>
                 <div className="lg:col-span-2">
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo de Leche</label>
                   <div className="relative">
                     <Beaker className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                     <select 
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none text-sm appearance-none transition-all"
                        value={formValues.milkType}
                        onChange={(e) => setFormValues({...formValues, milkType: e.target.value as MilkType})}
                     >
                       {Object.values(MilkType).map(t => <option key={t} value={t}>{t}</option>)}
                     </select>
                   </div>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha Recolección</label>
                   <input 
                      type="date" 
                      className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none text-sm transition-all"
                      value={formValues.date}
                      onChange={(e) => setFormValues({...formValues, date: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Volumen (ml)</label>
                   <input 
                      type="number" placeholder="0" 
                      className="w-full p-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-pink-200 outline-none font-bold text-slate-800 transition-all"
                      value={formValues.volume}
                      onChange={(e) => setFormValues({...formValues, volume: e.target.value})}
                   />
                 </div>
                 
                 <div className="lg:col-span-2 flex items-end justify-end gap-3 h-full pb-0.5 pt-4">
                   <button 
                      onClick={handleSaveJar}
                      className="px-6 py-3 bg-pink-600 text-white rounded-xl font-bold hover:bg-pink-700 shadow-md transition-colors flex items-center justify-center gap-2 w-full"
                   >
                     <Save size={18}/> Guardar Frasco
                   </button>
                 </div>
              </div>
            </div>
          ) : (
            /* --- NORMAL TABS VIEW --- */
            <>
              {/* TAB: GENERAL */}
              {activeTab === 'general' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <ConsentimientoStatus donorId={donor.id} donorName={donor.fullName} isSigned={localConsentSigned} consentDate={donor.consentDate}/>
                  
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                      <User size={20} className="text-slate-400"/> Datos Personales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                        <div>
                          <span className="block text-xs font-bold text-slate-400 uppercase mb-1">CURP</span>
                          <p className="text-base font-medium text-slate-800 font-mono tracking-wide">{donor.curp}</p>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Fecha de Nacimiento</span>
                          <p className="text-base font-medium text-slate-800">{donor.birthDate} ({donor.age} años)</p>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Ocupación</span>
                          <p className="text-base font-medium text-slate-800">{donor.occupation || 'No registrada'}</p>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Estado Civil</span>
                          <p className="text-base font-medium text-slate-800">{donor.civilStatus || 'No registrado'}</p>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Religión</span>
                          <p className="text-base font-medium text-slate-800">{donor.religion || 'No registrada'}</p>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Tipo de Donación</span>
                          <p className="text-base font-medium text-slate-800 bg-slate-50 inline-block px-3 py-1 rounded-lg border border-slate-200">
                            {donor.type}
                          </p>
                        </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* TAB: CLINICAL */}
              {activeTab === 'clinical' && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                   {/* Antecedentes Perinatales */}
                   <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                     <h3 className="text-lg font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                       <Activity size={20} className="text-slate-400"/> Antecedentes Perinatales
                     </h3>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                       <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                          <span className="block text-xs font-bold text-slate-500 uppercase mb-1">IMC</span>
                          <span className="text-2xl font-bold text-slate-800">{donor.bmi}</span>
                       </div>
                       <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                          <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Gestación</span>
                          <span className="text-2xl font-bold text-slate-800">{donor.gestationalAge} <span className="text-sm text-slate-400 font-normal">sem</span></span>
                       </div>
                       <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                          <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Edad Bebé</span>
                          <span className="text-2xl font-bold text-slate-800">{donor.infantAgeWeeks} <span className="text-sm text-slate-400 font-normal">sem</span></span>
                       </div>
                       <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                          <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Peso</span>
                          <span className="text-2xl font-bold text-slate-800">{donor.currentWeight} <span className="text-sm text-slate-400 font-normal">kg</span></span>
                       </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <p><strong className="text-slate-800">Control Perinatal:</strong> {donor.perinatalCareInstitution || 'No registrado'}</p>
                        <p><strong className="text-slate-800">Complicaciones:</strong> {donor.pregnancyComplications || 'Ninguna'}</p>
                     </div>
                   </div>

                   {/* Factores G-O & Habits */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full">
                        <h4 className="font-bold text-slate-800 text-sm mb-4 uppercase tracking-wide">Hábitos</h4>
                        <div className="flex flex-wrap gap-2">
                           {Object.entries(donor.habits || {}).map(([k, v]) => (
                             <div key={k} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border w-full justify-between ${v ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                               <span className="capitalize">{k}</span>
                               <span className="font-bold">{v ? 'SÍ' : 'NO'}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                     
                     <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full">
                        <h4 className="font-bold text-slate-800 text-sm mb-4 uppercase tracking-wide">Gineco-Obstétrico</h4>
                        <div className="grid grid-cols-2 gap-4 text-center">
                           <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                             <span className="block text-xl font-bold text-slate-700">{donor.gynObs?.pregnancies || 0}</span>
                             <span className="text-xs text-slate-500 uppercase font-bold">Gesta</span>
                           </div>
                           <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                             <span className="block text-xl font-bold text-slate-700">{donor.gynObs?.births || 0}</span>
                             <span className="text-xs text-slate-500 uppercase font-bold">Para</span>
                           </div>
                           <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                             <span className="block text-xl font-bold text-slate-700">{donor.gynObs?.cSections || 0}</span>
                             <span className="text-xs text-slate-500 uppercase font-bold">Cesáreas</span>
                           </div>
                           <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                             <span className="block text-xl font-bold text-slate-700">{donor.gynObs?.abortions || 0}</span>
                             <span className="text-xs text-slate-500 uppercase font-bold">Abortos</span>
                           </div>
                        </div>
                     </div>
                   </div>

                   {/* Serología */}
                   <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                     <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                       <FileText size={20} className="text-slate-400"/> Exámenes Serológicos
                     </h3>
                     <div className="overflow-hidden rounded-xl border border-slate-200">
                       <table className="w-full text-sm text-left">
                         <thead className="bg-slate-50 text-slate-500 font-medium">
                           <tr>
                             <th className="px-4 py-3">Prueba</th>
                             <th className="px-4 py-3">Fecha</th>
                             <th className="px-4 py-3 text-right">Resultado</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                           {donor.labResults?.filter(l => l.category === 'SEROLOGY').map((lab, i) => (
                             <tr key={i} className="bg-white">
                                <td className="px-4 py-3 font-medium text-slate-700">{lab.testName}</td>
                                <td className="px-4 py-3 text-slate-500">{lab.resultDate || '-'}</td>
                                <td className="px-4 py-3 text-right">
                                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold border ${
                                    lab.result === 'No Reactivo' 
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                      : 'bg-red-50 text-red-700 border-red-100'
                                  }`}>
                                    {lab.result}
                                  </span>
                                </td>
                             </tr>
                           ))}
                           {(!donor.labResults || donor.labResults.length === 0) && (
                             <tr><td colSpan={3} className="p-4 text-center text-slate-400">Sin resultados registrados</td></tr>
                           )}
                         </tbody>
                       </table>
                     </div>
                   </div>
                 </div>
              )}

              {/* TAB: CONTACT */}
              {activeTab === 'contact' && (
                 <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                       <h3 className="text-lg font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                         <MapPin size={20} className="text-slate-400"/> Información de Contacto
                       </h3>
                       
                       <div className="flex flex-col md:flex-row gap-8 items-start">
                          <div className="flex-1 space-y-6 w-full">
                             <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                  <Phone size={24}/>
                                </div>
                                <div>
                                  <p className="text-sm text-slate-500 mb-1">Teléfono Principal</p>
                                  <p className="text-xl font-bold text-slate-800">{donor.contactPhone}</p>
                                  <button className="text-xs text-blue-600 font-medium mt-1 hover:underline">Llamar ahora</button>
                                </div>
                             </div>

                             <div className="flex items-start gap-4">
                                <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
                                  <MapPin size={24}/>
                                </div>
                                <div>
                                  <p className="text-sm text-slate-500 mb-1">Dirección Domiciliaria</p>
                                  <p className="text-base font-medium text-slate-800">{donor.address}</p>
                                  <p className="text-sm text-slate-500 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <strong>Referencias:</strong> {donor.referenceAddress || 'Sin referencias'}
                                  </p>
                                </div>
                             </div>
                          </div>

                          {/* Placeholder Map */}
                          <div className="w-full md:w-1/2 h-64 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden group">
                             <MapPin size={48} className="mb-2 text-slate-300"/>
                             <p className="text-sm font-medium">Ubicación en Mapa</p>
                             <button className="mt-4 px-4 py-2 bg-white shadow-sm border border-slate-200 rounded-lg text-sm text-slate-600 font-medium hover:text-blue-600 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <ExternalLink size={16}/> Abrir en Google Maps
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>
              )}

              {/* TAB: HISTORY - VISUAL TIMELINE */}
              {activeTab === 'history' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                       <h3 className="font-bold text-slate-800 flex items-center gap-2">
                         <Milk size={20} className="text-slate-400"/> Historial de Donaciones
                       </h3>
                       <div className="flex gap-2">
                         <button className="text-sm text-slate-500 hover:text-blue-600 hover:bg-slate-50 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                           <Download size={18}/>
                         </button>
                       </div>
                    </div>
                    
                    {/* Visual Timeline Section */}
                    <div className="p-8">
                      <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 pb-2">
                        {history.map((item, idx) => (
                          <div key={idx} className="relative pl-8 animate-in slide-in-from-left-2 fade-in" style={{animationDelay: `${idx * 50}ms`}}>
                             {/* Timeline Dot */}
                             <div className={`absolute -left-[9px] top-1.5 w-5 h-5 rounded-full border-4 border-white shadow-sm z-10 ${getTimelineStatusColor(item.status)}`}></div>

                             {/* Content Card */}
                             <div className="bg-white border border-slate-100 rounded-xl p-4 hover:shadow-md transition-all group relative hover:border-pink-200">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                          <Calendar size={12}/> {item.date}
                                        </span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                                          <Clock size={12}/> {item.time}
                                        </span>
                                      </div>
                                      <h4 className="font-mono font-bold text-slate-800 text-lg tracking-wide group-hover:text-pink-600 transition-colors">
                                        {item.id}
                                      </h4>
                                      <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                                          Leche {item.type}
                                        </span>
                                        {item.batchId && (
                                          <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 flex items-center gap-1">
                                            <Building size={10}/> Lote: {item.batchId}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="text-right flex flex-col items-end">
                                      <span className="block font-bold text-slate-800 text-2xl">{item.vol} <span className="text-sm font-normal text-slate-400">ml</span></span>
                                      <div className="mt-2">
                                          {item.status === 'Lote Asignado' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Lote Asignado
                                            </span>
                                          ) : item.status === 'En Análisis' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div> En Análisis
                                            </span>
                                          ) : item.status === 'Verificada' ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div> Verificada
                                            </span>
                                          ) : (
                                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                              {item.status}
                                            </span>
                                          )}
                                      </div>
                                    </div>
                                </div>
                                
                                <button className="absolute right-4 bottom-4 p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                                  <ChevronRight size={20}/>
                                </button>
                             </div>
                          </div>
                        ))}
                      </div>
                      
                      {history.length === 0 && (
                        <div className="p-12 text-center text-slate-400">
                          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Milk size={24} className="opacity-50"/>
                          </div>
                          <p>No hay donaciones registradas aún.</p>
                          <button onClick={() => setShowNewDonationForm(true)} className="mt-3 text-pink-600 text-sm font-medium hover:underline">
                            Registrar primer frasco
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      <ConsentimientoModal isOpen={showConsentModal} onClose={() => setShowConsentModal(false)} donorId={donor.id} donorName={donor.fullName} onSuccess={() => setLocalConsentSigned(true)} />
    </div>
  );
};

export default DonorDetail;