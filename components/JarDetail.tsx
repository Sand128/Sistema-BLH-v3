import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, X, AlertCircle, Thermometer, Clock, MapPin, Milk, FileText } from 'lucide-react';
import { MilkJar, MilkStatus } from '../types';
import VerificationModal from './VerificationModal';

interface JarDetailProps {
  jar: MilkJar;
  onBack: () => void;
  onUpdate: (updatedJar: MilkJar) => void;
}

const JarDetail: React.FC<JarDetailProps> = ({ jar, onBack, onUpdate }) => {
  const [showVerification, setShowVerification] = useState(false);

  const handleApprove = (data: { temp: number; notes: string }) => {
    const updatedJar: MilkJar = {
      ...jar,
      status: MilkStatus.VERIFIED,
      history: [
        {
          date: new Date().toISOString(),
          action: 'Verificación Física Aprobada',
          user: 'Enf. Actual',
          details: `Temp: ${data.temp}°C. ${data.notes}`
        },
        ...jar.history
      ]
    };
    onUpdate(updatedJar);
    setShowVerification(false);
  };

  const handleReject = (reason: string, notes: string) => {
    const updatedJar: MilkJar = {
      ...jar,
      status: MilkStatus.DISCARDED,
      rejectionReason: reason,
      history: [
        {
          date: new Date().toISOString(),
          action: 'Rechazo en Verificación',
          user: 'Enf. Actual',
          details: `Causa: ${reason}. ${notes}`
        },
        ...jar.history
      ]
    };
    onUpdate(updatedJar);
    setShowVerification(false);
  };

  const getStatusBadge = (status: MilkStatus) => {
    switch (status) {
      case MilkStatus.RAW: return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Milk size={12}/> Cruda</span>;
      case MilkStatus.VERIFIED: return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Verificada</span>;
      case MilkStatus.DISCARDED: return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><X size={12}/> Descartada</span>;
      default: return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 font-mono">{jar.folio}</h2>
            <p className="text-slate-500 text-sm">Donadora: <span className="font-semibold text-slate-700">{jar.donorName}</span></p>
          </div>
        </div>
        <div>
          {getStatusBadge(jar.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
           {/* Primary Data Card */}
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
             <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Datos de Extracción</h3>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
               <div>
                 <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Volumen</span>
                 <span className="text-lg font-bold text-slate-800 flex items-center gap-1">
                   <Milk size={16} className="text-blue-400"/> {jar.volumeMl} mL
                 </span>
               </div>
               <div>
                 <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Tipo Leche</span>
                 <span className="text-lg font-medium text-slate-700">{jar.milkType}</span>
               </div>
               <div>
                 <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Fecha/Hora</span>
                 <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                   <Clock size={14} className="text-slate-400"/> {jar.extractionDate} {jar.extractionTime}
                 </span>
               </div>
               <div>
                 <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Lugar</span>
                 <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
                   <MapPin size={14} className="text-slate-400"/> {jar.extractionPlace}
                 </span>
               </div>
               <div>
                 <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Temp. Recepción</span>
                 <span className={`text-lg font-bold flex items-center gap-1 ${jar.receptionTemperature > 5 ? 'text-orange-600' : 'text-emerald-600'}`}>
                   <Thermometer size={16}/> {jar.receptionTemperature}°C
                 </span>
               </div>
               <div>
                  <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Ubicación Actual</span>
                  <span className="text-sm font-medium text-slate-700 bg-slate-50 px-2 py-1 rounded inline-block">
                    {jar.location || 'Recepción'}
                  </span>
               </div>
             </div>
             
             {jar.observations && (
               <div className="mt-6 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 italic border border-slate-100">
                 " {jar.observations} "
               </div>
             )}
             
             {jar.rejectionReason && (
                <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-100 flex gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-red-800">Motivo de Rechazo</h4>
                    <p className="text-sm text-red-700">{jar.rejectionReason}</p>
                  </div>
                </div>
             )}
           </div>

           {/* Timeline */}
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <FileText size={18} className="text-slate-400"/> Historial de Trazabilidad
              </h3>
              <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-4 before:w-0.5 before:bg-slate-200">
                {jar.history.map((event, idx) => (
                  <div key={idx} className="relative pl-10">
                    <div className="absolute left-3 top-1.5 h-3 w-3 rounded-full bg-slate-400 border-2 border-white ring-2 ring-slate-100"></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{event.action}</p>
                      <p className="text-xs text-slate-500 mb-1">{new Date(event.date).toLocaleString()} • {event.user}</p>
                      {event.details && <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded inline-block">{event.details}</p>}
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Right Col: Actions */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Acciones Disponibles</h3>
            
            <div className="space-y-3">
              {jar.status === MilkStatus.RAW && (
                <button 
                  onClick={() => setShowVerification(true)}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle2 size={18} />
                  Verificar Físicamente
                </button>
              )}

              {jar.status === MilkStatus.VERIFIED && (
                <button 
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Thermometer size={18} />
                  Enviar a Análisis
                </button>
              )}
              
              <button disabled className="w-full py-3 px-4 bg-white border border-slate-200 text-slate-400 rounded-lg font-medium flex items-center justify-center gap-2 cursor-not-allowed">
                 <FileText size={18} />
                 Imprimir Etiqueta
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
            <h4 className="text-blue-800 font-bold text-sm mb-2">Recordatorio Normativo</h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              La leche homóloga cruda refrigerada tiene una vigencia máxima de 12 horas. Si supera este tiempo, debe pasteurizarse o descartarse.
            </p>
          </div>
        </div>

      </div>

      {showVerification && (
        <VerificationModal 
          jar={jar} 
          onApprove={handleApprove} 
          onReject={handleReject} 
          onClose={() => setShowVerification(false)} 
        />
      )}
    </div>
  );
};

export default JarDetail;