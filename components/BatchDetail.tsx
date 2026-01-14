import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, FileText, Printer, Thermometer, FlaskConical, X } from 'lucide-react';
import { MilkBatch, MilkStatus } from '../types';

interface BatchDetailProps {
  batch: MilkBatch;
  onBack: () => void;
  onUpdate: (batch: MilkBatch) => void;
}

const BatchDetail: React.FC<BatchDetailProps> = ({ batch, onBack, onUpdate }) => {
  const [showMicroModal, setShowMicroModal] = useState(false);
  const [microResult, setMicroResult] = useState<'Negativo' | 'Positivo'>('Negativo');

  const handleSaveMicro = () => {
    const updatedBatch: MilkBatch = {
      ...batch,
      status: microResult === 'Negativo' ? MilkStatus.RELEASED : MilkStatus.DISCARDED,
      microbiology: {
        ...batch.microbiology!,
        result: microResult,
        resultDate: new Date().toISOString(),
        responsible: 'Q.F.B. Actual'
      }
    };
    onUpdate(updatedBatch);
    setShowMicroModal(false);
  };

  const getStatusBadge = (status: MilkStatus) => {
    switch (status) {
      case MilkStatus.QUARANTINE: return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><FlaskConical size={12}/> Cuarentena</span>;
      case MilkStatus.RELEASED: return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 size={12}/> Liberado</span>;
      case MilkStatus.DISCARDED: return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><X size={12}/> Rechazado</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 font-mono">{batch.folio}</h2>
            <p className="text-slate-500 text-sm">Tipo: <span className="font-semibold text-slate-700">{batch.type}</span> • {batch.milkType}</p>
          </div>
        </div>
        <div>
          {getStatusBadge(batch.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
             <h3 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Información del Lote</h3>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Volumen Total</span>
                  <span className="text-xl font-bold text-blue-600">{batch.volumeTotalMl} mL</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Frascos</span>
                  <span className="text-slate-700 font-medium">{batch.jarIds.length} unidades</span>
                </div>
                <div>
                  <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Donantes</span>
                  <span className="text-slate-700 font-medium">{batch.donors.length} participantes</span>
                </div>
                <div>
                   <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Fecha Formación</span>
                   <span className="text-sm text-slate-600">{new Date(batch.creationDate).toLocaleDateString()}</span>
                </div>
                <div>
                   <span className="block text-xs text-slate-400 uppercase font-bold mb-1">Caducidad (PEPS)</span>
                   <span className="text-sm font-bold text-orange-600">{batch.expirationDate ? new Date(batch.expirationDate).toLocaleDateString() : 'N/A'}</span>
                </div>
             </div>
             
             <div className="mt-6 pt-4 border-t border-slate-50">
               <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Donantes Incluidas:</h4>
               <div className="flex flex-wrap gap-2">
                 {batch.donors.map((d, i) => (
                   <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200">
                     {d.name}
                   </span>
                 ))}
               </div>
             </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
               <Thermometer size={18} className="text-orange-500"/> Registro de Pasteurización
             </h3>
             {batch.pasteurization ? (
               <div className="space-y-4">
                 <div className="flex gap-4 text-sm">
                   <div className="px-3 py-1 bg-orange-50 text-orange-800 rounded border border-orange-100">
                     Método: Holder (62.5°C x 30min)
                   </div>
                   <div className="px-3 py-1 bg-slate-50 text-slate-600 rounded border border-slate-100">
                     Resp: {batch.pasteurization.responsible}
                   </div>
                 </div>
                 {/* Mini Chart Visualization */}
                 <div className="h-24 flex items-end gap-0.5 bg-slate-50 rounded p-2 border border-slate-100">
                    {batch.pasteurization.tempCurve.map((p, i) => (
                      <div key={i} className="bg-orange-300 w-full rounded-t" style={{height: `${(p.temp/70)*100}%`}}></div>
                    ))}
                 </div>
               </div>
             ) : (
               <p className="text-slate-400 italic">Sin datos de pasteurización.</p>
             )}
          </div>
        </div>

        {/* Right Column: Actions & Status */}
        <div className="space-y-6">
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Control Microbiológico</h3>
              
              {batch.status === MilkStatus.QUARANTINE && (
                <div className="text-center py-4">
                  <FlaskConical size={32} className="text-amber-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700 mb-4">Lote en Cuarentena</p>
                  <p className="text-xs text-slate-500 mb-4">Fecha siembra: {new Date(batch.microbiology?.sowingDate || '').toLocaleDateString()}</p>
                  <button 
                    onClick={() => setShowMicroModal(true)}
                    className="w-full py-2 px-4 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold shadow-sm transition-colors"
                  >
                    Registrar Resultado
                  </button>
                </div>
              )}

              {batch.status === MilkStatus.RELEASED && (
                <div className="text-center py-4">
                  <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
                  <p className="text-lg font-bold text-emerald-700">Lote Liberado</p>
                  <p className="text-xs text-emerald-600 mb-4">Resultado: Negativo (Apto)</p>
                  
                  <button className="w-full py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg font-medium flex items-center justify-center gap-2 mb-2">
                    <FileText size={16}/> Ver Certificado
                  </button>
                  <button className="w-full py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg font-medium flex items-center justify-center gap-2">
                    <Printer size={16}/> Imprimir Etiqueta
                  </button>
                </div>
              )}

              {batch.status === MilkStatus.DISCARDED && (
                 <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-center">
                    <AlertTriangle className="text-red-500 mx-auto mb-2"/>
                    <p className="text-red-800 font-bold">Lote Rechazado</p>
                    <p className="text-xs text-red-600 mt-1">Causa: Cultivo Positivo</p>
                 </div>
              )}
           </div>

           {batch.status === MilkStatus.RELEASED && (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                 <h4 className="text-blue-800 font-bold text-sm mb-1">Inventario PEPS</h4>
                 <p className="text-xs text-blue-600">Este lote ha sido añadido al inventario disponible. Su prioridad de salida es media (Vence en 6 meses).</p>
              </div>
           )}
        </div>
      </div>

      {/* Micro Modal */}
      {showMicroModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Registro de Cultivo</h3>
              <p className="text-sm text-slate-500 mb-6">Seleccione el resultado del cultivo microbiológico tras 24/48h.</p>
              
              <div className="space-y-3 mb-6">
                <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${microResult === 'Negativo' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                  <input type="radio" name="res" checked={microResult === 'Negativo'} onChange={() => setMicroResult('Negativo')} className="text-emerald-600 focus:ring-emerald-500"/>
                  <div>
                    <span className="block font-bold text-slate-800">Negativo (-)</span>
                    <span className="text-xs text-slate-500">Sin crecimiento bacteriano. Apto.</span>
                  </div>
                </label>
                <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer ${microResult === 'Positivo' ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}>
                  <input type="radio" name="res" checked={microResult === 'Positivo'} onChange={() => setMicroResult('Positivo')} className="text-red-600 focus:ring-red-500"/>
                  <div>
                    <span className="block font-bold text-slate-800">Positivo (+)</span>
                    <span className="text-xs text-slate-500">Crecimiento detectado. Desechar.</span>
                  </div>
                </label>
              </div>

              <div className="flex gap-3">
                 <button onClick={() => setShowMicroModal(false)} className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                 <button onClick={handleSaveMicro} className="flex-1 py-2 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700">Guardar</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default BatchDetail;