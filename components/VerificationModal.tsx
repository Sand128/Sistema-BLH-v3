import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Thermometer, X } from 'lucide-react';
import { MilkJar } from '../types';

interface VerificationModalProps {
  jar: MilkJar;
  onApprove: (data: { temp: number; notes: string }) => void;
  onReject: (reason: string, notes: string) => void;
  onClose: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ jar, onApprove, onReject, onClose }) => {
  const [step, setStep] = useState<'INSPECTION' | 'DECISION'>('INSPECTION');
  const [checks, setChecks] = useState({
    integrity: false,
    foreignAgents: false,
    color: false,
    smell: false,
  });
  const [temp, setTemp] = useState<string>(jar.receptionTemperature.toString());
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');

  const allChecksPassed = Object.values(checks).every(Boolean);
  const tempValue = parseFloat(temp);
  const isTempHigh = !isNaN(tempValue) && tempValue > 5;

  const handleApprove = () => {
    onApprove({ temp: tempValue, notes });
  };

  const handleReject = () => {
    if (!rejectionReason) return;
    onReject(rejectionReason, notes);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Verificación Física</h3>
            <p className="text-xs text-slate-500 font-mono">Frasco: {jar.folio}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6 bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start gap-3">
             <div className="p-1.5 bg-blue-100 rounded-full">
               <Thermometer size={16} className="text-blue-600" />
             </div>
             <div>
               <p className="text-xs font-semibold text-blue-800 uppercase">Estado Actual</p>
               <p className="text-sm text-blue-700">Recepción: {jar.receptionTemperature}°C | Vol: {jar.volumeMl}mL</p>
             </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2">1. Inspección Visual</h4>
            
            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                checked={checks.integrity}
                onChange={(e) => setChecks(p => ({ ...p, integrity: e.target.checked }))}
                className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
              />
              <span className="text-sm text-slate-700">Envase íntegro (sin grietas, tapa sellada)</span>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                checked={checks.foreignAgents}
                onChange={(e) => setChecks(p => ({ ...p, foreignAgents: e.target.checked }))}
                className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
              />
              <span className="text-sm text-slate-700">Sin agentes extraños (cabellos, suciedad)</span>
            </label>

            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                checked={checks.color}
                onChange={(e) => setChecks(p => ({ ...p, color: e.target.checked }))}
                className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
              />
              <span className="text-sm text-slate-700">Color aceptable (blanco/amarillo/azulado)</span>
            </label>

             <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                checked={checks.smell}
                onChange={(e) => setChecks(p => ({ ...p, smell: e.target.checked }))}
                className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
              />
              <span className="text-sm text-slate-700">Olor característico (sin off-flavor)</span>
            </label>

            <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2 pt-2">2. Verificación Temperatura</h4>
            <div className="flex items-center gap-4">
               <div className="relative w-32">
                 <input 
                   type="number" 
                   step="0.1"
                   value={temp}
                   onChange={(e) => setTemp(e.target.value)}
                   className={`w-full pl-3 pr-8 py-2 border rounded-lg font-bold outline-none focus:ring-2 ${
                     isTempHigh ? 'border-orange-300 text-orange-600 focus:ring-orange-200' : 'border-slate-300 text-slate-700 focus:ring-pink-200'
                   }`}
                 />
                 <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">°C</span>
               </div>
               {isTempHigh && (
                 <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
                   <AlertTriangle size={12}/> Temperatura elevada (>5°C)
                 </span>
               )}
            </div>

            <div className="pt-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                rows={2}
                placeholder="Notas adicionales..."
              />
            </div>

            {!allChecksPassed && (
               <div className="bg-red-50 border border-red-100 p-3 rounded-lg mt-4">
                 <label className="block text-xs font-bold text-red-800 mb-1">Causa de Rechazo (Obligatorio si fallan checks)</label>
                 <select 
                   value={rejectionReason}
                   onChange={(e) => setRejectionReason(e.target.value)}
                   className="w-full p-2 border border-red-200 rounded text-sm text-red-900 bg-white"
                 >
                   <option value="">Seleccione causa...</option>
                   <option value="Suciedad visible">Suciedad / Agentes extraños</option>
                   <option value="Envase dañado">Envase roto o mal sellado</option>
                   <option value="Color anormal">Color anormal (sangre/pus)</option>
                   <option value="Olor desagradable">Olor desagradable (agrio/rancio)</option>
                 </select>
               </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
          >
            Cancelar
          </button>
          
          {allChecksPassed ? (
             <button 
               onClick={handleApprove}
               className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 flex items-center gap-2 shadow-sm"
             >
               <CheckCircle2 size={18} />
               Aprobar Frasco
             </button>
          ) : (
             <button 
               onClick={handleReject}
               disabled={!rejectionReason}
               className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <X size={18} />
               Rechazar Frasco
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;