import React, { useState } from 'react';
import { MilkBatch, StorageUnit } from '../types';
import { MapPin, AlertTriangle, X, Check, ArrowRight, Trash2 } from 'lucide-react';

// --- MOVE MODAL ---
interface MoveModalProps {
  item: MilkBatch;
  units: StorageUnit[];
  onConfirm: (itemId: string, newLocation: { equipmentId: string, shelf: number, position: string }) => void;
  onCancel: () => void;
}

export const MoveModal: React.FC<MoveModalProps> = ({ item, units, onConfirm, onCancel }) => {
  const [targetUnit, setTargetUnit] = useState(units[0].id);
  const [targetShelf, setTargetShelf] = useState(1);
  const [targetPos, setTargetPos] = useState('');

  const selectedUnit = units.find(u => u.id === targetUnit);

  const handleSubmit = () => {
    if (!targetPos) return;
    onConfirm(item.id, { equipmentId: targetUnit, shelf: targetShelf, position: targetPos });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <MapPin size={20} className="text-blue-500"/> Mover Inventario
          </h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-4">
             <p className="text-xs text-blue-600 font-bold uppercase mb-1">Item Seleccionado</p>
             <p className="font-bold text-slate-800">{item.folio}</p>
             <p className="text-sm text-slate-600">{item.volumeTotalMl} mL • {item.milkType}</p>
             <p className="text-xs text-slate-500 mt-1">
               Ubicación Actual: {item.location?.equipmentId} (E{item.location?.shelf}-{item.location?.position})
             </p>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Equipo Destino</label>
             <select 
               className="w-full p-2 border border-slate-300 rounded-lg"
               value={targetUnit}
               onChange={(e) => setTargetUnit(e.target.value)}
             >
               {units.map(u => (
                 <option key={u.id} value={u.id}>{u.name} ({u.temperature}°C)</option>
               ))}
             </select>
          </div>

          <div className="flex gap-4">
             <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Estante</label>
                <select 
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  value={targetShelf}
                  onChange={(e) => setTargetShelf(parseInt(e.target.value))}
                >
                  {selectedUnit && Array.from({length: selectedUnit.shelves}).map((_, i) => (
                    <option key={i+1} value={i+1}>Estante {i+1}</option>
                  ))}
                </select>
             </div>
             <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Posición</label>
                <input 
                  type="text" 
                  placeholder="Ej: A-05"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                  value={targetPos}
                  onChange={(e) => setTargetPos(e.target.value)}
                />
             </div>
          </div>
          
          <div className="pt-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Razón del movimiento</label>
            <select className="w-full p-2 border border-slate-300 rounded-lg text-sm">
               <option>Reorganización de inventario</option>
               <option>Preparación para administración</option>
               <option>Mantenimiento de equipo</option>
            </select>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-b-xl border-t border-slate-200 flex justify-end gap-3">
           <button onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium">Cancelar</button>
           <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-bold flex items-center gap-2">
             <ArrowRight size={16}/> Confirmar Mover
           </button>
        </div>
      </div>
    </div>
  );
};

// --- DISCARD MODAL ---
interface DiscardModalProps {
  item: MilkBatch;
  onConfirm: (itemId: string, reason: string) => void;
  onCancel: () => void;
}

export const DiscardModal: React.FC<DiscardModalProps> = ({ item, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');
  const [signature, setSignature] = useState('');
  const [confirmCheck, setConfirmCheck] = useState(false);

  const canSubmit = reason && signature.length > 3 && confirmCheck;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in duration-200 border-t-4 border-red-500">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-red-700 flex items-center gap-2">
            <Trash2 size={20} /> Desechar Inventario
          </h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-sm text-red-800">
             <strong className="block mb-1">¡Acción Irreversible!</strong>
             Se dará de baja el lote <strong>{item.folio}</strong> ({item.volumeTotalMl}mL) del inventario activo.
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Motivo de Desecho *</label>
             <select 
               className="w-full p-2 border border-slate-300 rounded-lg"
               value={reason}
               onChange={(e) => setReason(e.target.value)}
             >
               <option value="">Seleccione motivo...</option>
               <option value="Caducidad Excedida">Caducidad Excedida</option>
               <option value="Microbiología Positiva">Resultado Microbiológico Positivo</option>
               <option value="Rotura de Envase">Rotura de Envase / Contaminación</option>
               <option value="Falla Cadena Frío">Falla en Cadena de Frío</option>
             </select>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Firma Digital (Responsable) *</label>
             <input 
               type="text" 
               placeholder="Escriba su nombre completo"
               className="w-full p-2 border border-slate-300 rounded-lg font-mono bg-slate-50"
               value={signature}
               onChange={(e) => setSignature(e.target.value)}
             />
          </div>

          <label className="flex items-start gap-2 pt-2 cursor-pointer">
             <input 
               type="checkbox" 
               checked={confirmCheck}
               onChange={(e) => setConfirmCheck(e.target.checked)}
               className="mt-1 w-4 h-4 text-red-600 rounded"
             />
             <span className="text-xs text-slate-600">
               Certifico que he verificado físicamente el lote y confirmo su disposición final según la normativa ambiental.
             </span>
          </label>
        </div>

        <div className="p-4 bg-slate-50 rounded-b-xl border-t border-slate-200 flex justify-end gap-3">
           <button onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium">Cancelar</button>
           <button 
             onClick={() => onConfirm(item.id, reason)}
             disabled={!canSubmit}
             className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Trash2 size={16}/> Confirmar Desecho
           </button>
        </div>
      </div>
    </div>
  );
};
