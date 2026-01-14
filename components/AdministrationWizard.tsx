import React, { useState } from 'react';
import { 
  ArrowLeft, CheckCircle2, AlertTriangle, Droplet, 
  Calendar, Thermometer, Clock, FileCheck, ArrowRight 
} from 'lucide-react';
import { Receiver, MilkBatch, MilkStatus, AdministrationRecord } from '../types';

// Mock inventory for PEPS selection
const MOCK_INVENTORY_FOR_DOSAGE: MilkBatch[] = [
  { 
    id: 'B1', folio: 'LP-2024-05-20-001', type: 'Heteróloga', milkType: 'Calostro' as any, 
    volumeTotalMl: 150, status: MilkStatus.RELEASED, creationDate: '2024-05-20', expirationDate: '2024-05-30',
    donors: [], jarIds: [] 
  },
  { 
    id: 'B2', folio: 'LP-2024-05-21-002', type: 'Heteróloga', milkType: 'Madura' as any, 
    volumeTotalMl: 200, status: MilkStatus.RELEASED, creationDate: '2024-05-21', expirationDate: '2024-11-21',
    donors: [], jarIds: [] 
  }
];

interface AdministrationWizardProps {
  receiver: Receiver;
  onComplete: (record: AdministrationRecord) => void;
  onCancel: () => void;
}

const AdministrationWizard: React.FC<AdministrationWizardProps> = ({ receiver, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [selectedBatch, setSelectedBatch] = useState<MilkBatch | null>(null);
  
  // Admin Data
  const [volumeAdmin, setVolumeAdmin] = useState(receiver.prescription?.volumePerTake || 0);
  const [volumeDiscard, setVolumeDiscard] = useState(0);
  const [discardReason, setDiscardReason] = useState('');
  const [adminTemp, setAdminTemp] = useState(16); // Ideal 16C
  const [adminVia, setAdminVia] = useState<'Sonda Nasogástrica' | 'Oral'>('Sonda Nasogástrica');

  // Filter & Sort Inventory (PEPS)
  const filteredInventory = MOCK_INVENTORY_FOR_DOSAGE.sort((a, b) => 
    new Date(a.expirationDate || '').getTime() - new Date(b.expirationDate || '').getTime()
  );

  const handleFinish = () => {
    if (!selectedBatch) return;
    
    const record: AdministrationRecord = {
      id: `ADM-${Date.now()}`,
      receiverId: receiver.id,
      receiverName: receiver.fullName,
      batchId: selectedBatch.id,
      batchFolio: selectedBatch.folio,
      volumePrescribed: receiver.prescription?.volumePerTake || 0,
      volumeAdministered: volumeAdmin,
      volumeDiscarded: volumeDiscard,
      discardReason: volumeDiscard > 0 ? discardReason : undefined,
      timestamp: new Date().toISOString(),
      responsible: 'Enf. Actual', // Mock user
      temperature: adminTemp,
      via: adminVia
    };
    onComplete(record);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Administrar Leche</h2>
          <p className="text-xs text-slate-500 font-mono">Receptor: {receiver.fullName} ({receiver.expediente})</p>
        </div>
        <div className="flex items-center gap-2">
           <div className={`h-2 w-8 rounded-full ${step >= 1 ? 'bg-pink-500' : 'bg-slate-300'}`}></div>
           <div className={`h-2 w-8 rounded-full ${step >= 2 ? 'bg-pink-500' : 'bg-slate-300'}`}></div>
           <div className={`h-2 w-8 rounded-full ${step >= 3 ? 'bg-pink-500' : 'bg-slate-300'}`}></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        
        {/* STEP 1: SELECT BATCH (PEPS) */}
        {step === 1 && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-right-4">
             <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex justify-between items-center">
                <div>
                   <h4 className="text-sm font-bold text-blue-800">Prescripción Actual</h4>
                   <p className="text-xs text-blue-600">
                     Volumen toma: <strong>{receiver.prescription?.volumePerTake} mL</strong> • 
                     Frecuencia: {receiver.prescription?.frequency}/día • 
                     Pref: {receiver.prescription?.milkTypePreference}
                   </p>
                </div>
                <Droplet className="text-blue-400" size={24}/>
             </div>

             <h3 className="font-bold text-slate-700">Inventario Disponible (PEPS)</h3>
             <div className="space-y-3">
               {filteredInventory.map((batch, idx) => (
                 <div 
                   key={batch.id}
                   onClick={() => setSelectedBatch(batch)}
                   className={`bg-white p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center group
                     ${selectedBatch?.id === batch.id 
                       ? 'border-pink-500 ring-1 ring-pink-500 shadow-md' 
                       : 'border-slate-200 hover:border-pink-300'}
                   `}
                 >
                    <div className="flex items-center gap-4">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                         ${idx === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}
                       `}>
                         {idx + 1}
                       </div>
                       <div>
                         <p className="font-bold text-slate-800">{batch.folio}</p>
                         <p className="text-xs text-slate-500">{batch.type} • {batch.milkType}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-bold text-slate-700">{batch.volumeTotalMl} mL</p>
                       <p className={`text-xs ${idx === 0 ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                         Vence: {new Date(batch.expirationDate || '').toLocaleDateString()}
                       </p>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        )}

        {/* STEP 2: DOSAGE RECORD */}
        {step === 2 && selectedBatch && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
               <span className="text-sm font-bold text-slate-700">Lote Seleccionado:</span>
               <span className="font-mono text-pink-600 bg-pink-50 px-2 py-1 rounded">{selectedBatch.folio}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Volumen Administrado (mL)</label>
                  <input type="number" 
                    value={volumeAdmin}
                    onChange={(e) => setVolumeAdmin(parseFloat(e.target.value))}
                    className="w-full p-3 border border-slate-300 rounded-lg text-lg font-bold text-slate-800"
                  />
                  {volumeAdmin > (receiver.prescription?.volumePerTake || 0) && (
                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                      <AlertTriangle size={12}/> Excede prescripción ({receiver.prescription?.volumePerTake}mL)
                    </p>
                  )}
               </div>
               
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Volumen Desechado (mL)</label>
                  <input type="number" 
                    value={volumeDiscard}
                    onChange={(e) => setVolumeDiscard(parseFloat(e.target.value))}
                    className="w-full p-3 border border-slate-300 rounded-lg text-slate-600"
                  />
               </div>

               {volumeDiscard > 0 && (
                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Causa de Desecho</label>
                    <select 
                      value={discardReason}
                      onChange={(e) => setDiscardReason(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    >
                      <option value="">Seleccione...</option>
                      <option value="Rechazo del receptor">Rechazo del receptor</option>
                      <option value="Derrame accidental">Derrame accidental</option>
                      <option value="Sobros">Sobros de toma anterior</option>
                    </select>
                 </div>
               )}

               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">
                   <Thermometer size={14}/> Temperatura Leche (°C)
                 </label>
                 <input type="number" 
                    value={adminTemp}
                    onChange={(e) => setAdminTemp(parseFloat(e.target.value))}
                    className={`w-full p-2 border rounded-lg ${adminTemp < 14 || adminTemp > 18 ? 'border-orange-300 bg-orange-50' : 'border-slate-300'}`}
                  />
                  {(adminTemp < 14 || adminTemp > 18) && <span className="text-xs text-orange-600">Recomendado: 14-18°C</span>}
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Vía de Administración</label>
                 <select 
                   value={adminVia}
                   onChange={(e) => setAdminVia(e.target.value as any)}
                   className="w-full p-2 border border-slate-300 rounded-lg"
                 >
                   <option value="Sonda Nasogástrica">Sonda Nasogástrica</option>
                   <option value="Sonda Orogástrica">Sonda Orogástrica</option>
                   <option value="Oral">Oral (Succión)</option>
                 </select>
               </div>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS / CERTIFICATE */}
        {step === 3 && (
          <div className="max-w-lg mx-auto text-center pt-8 animate-in zoom-in">
             <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <FileCheck size={32} />
             </div>
             <h3 className="text-2xl font-bold text-slate-800 mb-2">Administración Registrada</h3>
             <p className="text-slate-500 mb-6">Se ha generado el Formato 459-24 correctamente.</p>
             
             <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-left space-y-3 mb-6">
                <div className="flex justify-between text-sm border-b border-slate-200 pb-2">
                   <span className="text-slate-500">Receptor</span>
                   <span className="font-bold text-slate-700">{receiver.fullName}</span>
                </div>
                <div className="flex justify-between text-sm border-b border-slate-200 pb-2">
                   <span className="text-slate-500">Lote</span>
                   <span className="font-mono text-slate-700">{selectedBatch?.folio}</span>
                </div>
                <div className="flex justify-between text-sm">
                   <span className="text-slate-500">Volumen Admin</span>
                   <span className="font-bold text-emerald-600">{volumeAdmin} mL</span>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
         <button onClick={onCancel} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">
           Cancelar
         </button>
         
         <div className="flex gap-3">
           {step === 1 && (
             <button 
               onClick={() => setStep(2)}
               disabled={!selectedBatch}
               className="px-6 py-2 bg-slate-800 text-white font-medium hover:bg-slate-700 rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2"
             >
               Siguiente <ArrowRight size={16}/>
             </button>
           )}
           {step === 2 && (
             <button 
               onClick={() => setStep(3)}
               className="px-6 py-2 bg-pink-600 text-white font-bold hover:bg-pink-700 rounded-lg shadow-md flex items-center gap-2"
             >
               <CheckCircle2 size={16}/> Confirmar y Registrar
             </button>
           )}
           {step === 3 && (
             <button 
               onClick={handleFinish}
               className="px-6 py-2 bg-emerald-600 text-white font-bold hover:bg-emerald-700 rounded-lg shadow-md"
             >
               Finalizar
             </button>
           )}
         </div>
      </div>
    </div>
  );
};

export default AdministrationWizard;