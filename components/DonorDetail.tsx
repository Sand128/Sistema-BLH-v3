import React, { useState } from 'react';
import { 
  ArrowLeft, Edit, FileText, MapPin, Milk, Calendar, 
  ChevronRight, User, Activity, Phone, Plus, Printer, 
  Save, X, Droplet, ExternalLink, FileSignature, AlertCircle
} from 'lucide-react';
import { Donor, DonorStatus, MilkType } from '../types';
import { ConsentimientoModal } from './consentimiento/ConsentimientoModal';
import { ConsentimientoStatus } from './consentimiento/ConsentimientoStatus';

interface DonorDetailProps {
  donor: Donor;
  onBack: () => void;
  onEdit: () => void;
}

type TabType = 'general' | 'clinical' | 'contact' | 'history';

const DonorDetail: React.FC<DonorDetailProps> = ({ donor, onBack, onEdit }) => {
  const [activeTab, setActiveTab] = useState<TabType>('history');
  const [showNewDonationForm, setShowNewDonationForm] = useState(true);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [localConsentSigned, setLocalConsentSigned] = useState(donor.consentSigned);

  // Mock History Data
  const mockHistory = [
    { id: 'HO09A26003', date: '09/01/2026', vol: 45, status: 'Lote Asignado', type: 'Madura' },
    { id: 'HO09A26002', date: '08/01/2026', vol: 120, status: 'En Análisis', type: 'Madura' },
    { id: 'HO09A26001', date: '05/01/2026', vol: 150, status: 'Verificada', type: 'Transición' },
  ];

  const getStatusBadge = (status: DonorStatus) => {
    switch (status) {
      case DonorStatus.ACTIVE: 
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-600 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Activa</span>;
      case DonorStatus.PENDING: 
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-600 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Pendiente</span>;
      default: 
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">{status}</span>;
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
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                Folio: {donor.folio}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                Exp: {donor.expediente}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={onEdit} className="flex-1 md:flex-none px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold text-sm rounded-xl hover:bg-slate-50 flex items-center justify-center gap-2">
            <Edit size={16} /> Actualizar
          </button>
          
          {localConsentSigned ? (
             <button className="flex-1 md:flex-none px-4 py-2.5 border border-blue-100 text-blue-600 bg-blue-50 font-semibold text-sm rounded-xl hover:bg-blue-100 flex items-center justify-center gap-2">
               <FileText size={16} /> Consentimiento
             </button>
          ) : (
             <button onClick={() => setShowConsentModal(true)} className="flex-1 md:flex-none px-4 py-2.5 border border-blue-200 text-white bg-blue-600 font-semibold text-sm rounded-xl hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2 animate-pulse">
               <FileSignature size={16} /> Firmar
             </button>
          )}

          <button 
            onClick={() => { setActiveTab('history'); setShowNewDonationForm(true); }}
            disabled={!localConsentSigned}
            className={`flex-1 md:flex-none px-5 py-2.5 font-semibold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 ${localConsentSigned ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
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
                { id: 'clinical', label: 'Historial Médico', icon: Activity },
                { id: 'contact', label: 'Contacto', icon: MapPin },
                { id: 'history', label: 'Donaciones', icon: Milk },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as TabType)}
                  className={`relative px-6 py-4 flex items-center gap-3 text-sm font-medium transition-all ${activeTab === item.id ? 'text-rose-600 bg-rose-50/50' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {activeTab === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 rounded-r-full"></div>}
                  <item.icon size={18} className={activeTab === item.id ? 'text-rose-500' : 'text-slate-400'} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="lg:col-span-3">
          
          {/* TAB: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <ConsentimientoStatus donorId={donor.id} donorName={donor.fullName} isSigned={localConsentSigned} consentDate={donor.consentDate}/>
              
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                <h3 className="text-lg font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">Datos Personales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-6">
                    <div>
                      <span className="block text-xs font-bold text-slate-400 uppercase mb-1">CURP</span>
                      <p className="text-base font-medium text-slate-800 font-mono">{donor.curp}</p>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Edad</span>
                      <p className="text-base font-medium text-slate-800">{donor.age} años</p>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Ocupación</span>
                      <p className="text-base font-medium text-slate-800">{donor.occupation || 'No registrada'}</p>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Religión</span>
                      <p className="text-base font-medium text-slate-800">{donor.religion || 'No registrada'}</p>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Estado Civil</span>
                      <p className="text-base font-medium text-slate-800">{donor.civilStatus || 'No registrado'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Domicilio</span>
                      <p className="text-base font-medium text-slate-800">{donor.address}</p>
                      <p className="text-sm text-slate-500 mt-1">Ref: {donor.referenceAddress}</p>
                    </div>
                </div>
              </div>
            </div>
          )}
          
          {/* TAB: CLINICAL */}
          {activeTab === 'clinical' && (
             <div className="space-y-6">
               <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                 <h3 className="text-lg font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">Antecedentes Perinatales</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                   <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="block text-xs font-bold text-slate-500 uppercase mb-1">IMC</span>
                      <span className="text-xl font-bold text-slate-800">{donor.bmi}</span>
                   </div>
                   <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Sem. Gestación</span>
                      <span className="text-xl font-bold text-slate-800">{donor.gestationalAge}</span>
                   </div>
                   <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Edad Bebé</span>
                      <span className="text-xl font-bold text-slate-800">{donor.infantAgeWeeks} sem</span>
                   </div>
                   <div className="p-3 bg-slate-50 rounded-xl">
                      <span className="block text-xs font-bold text-slate-500 uppercase mb-1">Peso Actual</span>
                      <span className="text-xl font-bold text-slate-800">{donor.currentWeight} kg</span>
                   </div>
                 </div>
                 <div className="text-sm text-slate-600">
                    <p><strong>Control Perinatal:</strong> {donor.perinatalCareInstitution || 'No registrado'}</p>
                    <p><strong>Complicaciones:</strong> {donor.pregnancyComplications || 'Ninguna'}</p>
                 </div>
               </div>

               <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                 <h3 className="text-lg font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">Factores de Riesgo y G-O</h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                       <h4 className="font-bold text-slate-700 uppercase text-xs mb-3">Hábitos</h4>
                       <div className="flex flex-wrap gap-2">
                          {Object.entries(donor.habits || {}).map(([k, v]) => (
                            <span key={k} className={`px-3 py-1 rounded-full text-xs font-bold ${v ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                              {k.toUpperCase()}: {v ? 'SÍ' : 'NO'}
                            </span>
                          ))}
                       </div>
                    </div>
                    <div>
                       <h4 className="font-bold text-slate-700 uppercase text-xs mb-3">Historial G-O</h4>
                       <div className="grid grid-cols-4 gap-2 text-center text-sm">
                          <div className="bg-slate-50 p-2 rounded">
                            <span className="block font-bold">{donor.gynObs?.pregnancies || 0}</span>
                            <span className="text-xs text-slate-500">Gesta</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded">
                            <span className="block font-bold">{donor.gynObs?.births || 0}</span>
                            <span className="text-xs text-slate-500">Para</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded">
                            <span className="block font-bold">{donor.gynObs?.cSections || 0}</span>
                            <span className="text-xs text-slate-500">Cesáreas</span>
                          </div>
                          <div className="bg-slate-50 p-2 rounded">
                            <span className="block font-bold">{donor.gynObs?.abortions || 0}</span>
                            <span className="text-xs text-slate-500">Abortos</span>
                          </div>
                       </div>
                    </div>
                 </div>
               </div>

               <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
                 <h3 className="text-lg font-bold text-slate-800 mb-4">Serología</h3>
                 <div className="space-y-2">
                   {donor.labResults?.map((lab, i) => (
                     <div key={i} className="flex justify-between items-center p-3 border border-slate-100 rounded-lg">
                        <span className="font-medium text-slate-700">{lab.testName}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${lab.result === 'No Reactivo' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                          {lab.result}
                        </span>
                     </div>
                   ))}
                 </div>
               </div>
             </div>
          )}

          {/* TAB: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              {showNewDonationForm && (
                <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-rose-800">Nueva Etiqueta</h4>
                    <button onClick={() => setShowNewDonationForm(false)}><X size={18} className="text-rose-400"/></button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <input type="date" className="p-2 border rounded"/>
                     <input type="number" placeholder="Volumen (ml)" className="p-2 border rounded"/>
                  </div>
                  <button className="mt-4 w-full bg-rose-600 text-white py-2 rounded font-bold">Generar</button>
                </div>
              )}
              {mockHistory.map((item, idx) => (
                 <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded flex items-center justify-center"><Printer size={20}/></div>
                       <div>
                         <p className="font-bold text-slate-700">{item.id}</p>
                         <p className="text-xs text-slate-500">{item.date} • {item.type}</p>
                       </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-slate-800">{item.vol} ml</span>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{item.status}</span>
                    </div>
                 </div>
              ))}
            </div>
          )}

          {/* TAB: CONTACT */}
          {activeTab === 'contact' && (
             <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                <Phone size={48} className="mx-auto text-blue-300 mb-4"/>
                <h3 className="text-xl font-bold text-slate-800">{donor.contactPhone}</h3>
                <p className="text-slate-500">Contacto Principal</p>
             </div>
          )}

        </div>
      </div>

      <ConsentimientoModal isOpen={showConsentModal} onClose={() => setShowConsentModal(false)} donorId={donor.id} donorName={donor.fullName} onSuccess={() => setLocalConsentSigned(true)} />
    </div>
  );
};

export default DonorDetail;