import React, { useState } from 'react';
import { 
  ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, X, 
  Flame, Eye, Activity, Save, Thermometer, FlaskConical 
} from 'lucide-react';
import { MilkBatch, MilkStatus, CaloricClassification } from '../types';

interface AnalysisWizardProps {
  batch: MilkBatch;
  onComplete: (batch: MilkBatch) => void;
  onCancel: () => void;
}

const AnalysisWizard: React.FC<AnalysisWizardProps> = ({ batch, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [processingBatch, setProcessingBatch] = useState<MilkBatch>({ ...batch });
  
  // Local state for each step to handle inputs before saving to batch object
  
  // STEP 1: HOLDER
  const [holderData, setHolderData] = useState({
    done: false,
    tempMax: 62.5,
    timeMin: 30,
    operator: 'Q.F.B. Actual'
  });

  // STEP 2: PHYSICAL
  const [physicalData, setPhysicalData] = useState({
    color: 'Blanco',
    smell: 'Normal',
    debris: false,
    notes: ''
  });

  // STEP 3: CHEMICAL
  const [chemicalData, setChemicalData] = useState({
    acidity: 0,
    creamatocrit: 0,
    classification: CaloricClassification.NORMOCALORIC
  });

  // --- HANDLERS ---

  const handleHolderConfirm = () => {
    setHolderData(prev => ({ ...prev, done: true }));
  };

  const handleChemicalChange = (field: string, value: number) => {
    let classification = chemicalData.classification;
    
    if (field === 'creamatocrit') {
       if (value < 500) classification = CaloricClassification.HYPOCALORIC;
       else if (value > 700) classification = CaloricClassification.HYPERCALORIC;
       else classification = CaloricClassification.NORMOCALORIC;
    }

    setChemicalData(prev => ({ ...prev, [field]: value, classification }));
  };

  const finalizeProcess = () => {
    // Determine status based on results
    let finalStatus = MilkStatus.QUARANTINE; // Success path -> Quarantine waiting for Micro
    let rejectionReason = undefined;

    // Fail conditions
    if (physicalData.color === 'Rojo/Sangre' || physicalData.color === 'Verde/Pus' || physicalData.debris) {
      finalStatus = MilkStatus.DISCARDED;
      rejectionReason = "Falla en Análisis Físico (Color/Suciedad)";
    } else if (chemicalData.acidity > 8) {
      finalStatus = MilkStatus.DISCARDED;
      rejectionReason = `Acidez elevada: ${chemicalData.acidity}°D`;
    }

    const updatedBatch: MilkBatch = {
      ...processingBatch,
      status: finalStatus,
      // In a real app, we'd map physical/chemical data to the Batch structure
      pasteurization: {
        completed: true,
        date: new Date().toISOString(),
        responsible: holderData.operator,
        tempCurve: [] 
      }
    };

    onComplete(updatedBatch);
  };

  // UI Helpers
  const steps = [
    { id: 1, label: 'Método Holder', icon: Flame },
    { id: 2, label: 'Análisis Físico', icon: Eye },
    { id: 3, label: 'Fisicoquímico', icon: Activity },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-[calc(100vh-140px)]">
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FlaskConical className="text-blue-600" />
            Procesamiento de Lote
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-1">Folio: {batch.folio}</p>
        </div>
        
        {/* Stepper */}
        <div className="flex items-center gap-4">
          {steps.map((s, idx) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors
                ${step === s.id 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : step > s.id 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'}
              `}>
                <s.icon size={14} />
                {step > s.id && <CheckCircle2 size={12} className="ml-1"/>}
                <span className="hidden md:inline">{s.label}</span>
              </div>
              {idx < steps.length - 1 && <div className="w-6 h-px bg-slate-300"></div>}
            </div>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 flex justify-center">
        <div className="w-full max-w-3xl">
          
          {/* STEP 1: HOLDER */}
          {step === 1 && (
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm animate-in fade-in slide-in-from-right-4">
               <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <Flame className="text-orange-500"/> Pasteurización Holder
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Temperatura Objetivo (°C)</label>
                      <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                        <Thermometer size={20} className="text-orange-600"/>
                        <span className="text-xl font-bold text-slate-800">62.5</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Tiempo de Ciclo (min)</label>
                      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <Activity size={20} className="text-blue-600"/>
                        <span className="text-xl font-bold text-slate-800">30:00</span>
                      </div>
                    </div>
                 </div>

                 <div className="flex flex-col justify-center items-center p-6 bg-slate-50 rounded-xl border border-slate-200">
                    {!holderData.done ? (
                      <>
                        <p className="text-sm text-slate-500 mb-4 text-center">
                          Confirme que el equipo ha completado el ciclo térmico correctamente.
                        </p>
                        <button 
                          onClick={handleHolderConfirm}
                          className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
                        >
                          <CheckCircle2 size={24}/> Confirmar Ciclo Exitoso
                        </button>
                      </>
                    ) : (
                      <div className="text-center text-emerald-600 animate-in zoom-in">
                        <CheckCircle2 size={48} className="mx-auto mb-2"/>
                        <p className="font-bold text-lg">Pasteurización Registrada</p>
                        <p className="text-xs text-emerald-800">Listo para siguiente fase</p>
                      </div>
                    )}
                 </div>
               </div>
            </div>
          )}

          {/* STEP 2: PHYSICAL */}
          {step === 2 && (
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm animate-in fade-in slide-in-from-right-4">
               <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <Eye className="text-blue-500"/> Análisis Físico Post-Pasteurización
               </h3>

               <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Coloración</label>
                      <select 
                        className="w-full p-3 border border-slate-300 rounded-lg bg-white"
                        value={physicalData.color}
                        onChange={(e) => setPhysicalData({...physicalData, color: e.target.value})}
                      >
                        <option value="Blanco">Blanco</option>
                        <option value="Amarillo">Amarillo (Calostro/Transición)</option>
                        <option value="Verdoso">Verdoso (Normal)</option>
                        <option value="Azulado">Azulado (Madura)</option>
                        <option value="Rojo/Sangre">🔴 Rojo / Sangre (Rechazo)</option>
                        <option value="Verde/Pus">🔴 Verde / Pus (Rechazo)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Olor</label>
                      <select 
                        className="w-full p-3 border border-slate-300 rounded-lg bg-white"
                        value={physicalData.smell}
                        onChange={(e) => setPhysicalData({...physicalData, smell: e.target.value})}
                      >
                        <option value="Normal">Sui Generis (Normal)</option>
                        <option value="Agrio">🔴 Agrio / Ácido</option>
                        <option value="Rancio">🔴 Rancio</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                     <label className="flex items-center gap-3 cursor-pointer">
                       <input 
                         type="checkbox" 
                         className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                         checked={physicalData.debris}
                         onChange={(e) => setPhysicalData({...physicalData, debris: e.target.checked})}
                       />
                       <span className="font-medium text-slate-700">Presencia de suciedad o precipitados anormales</span>
                     </label>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Observaciones</label>
                    <textarea 
                      rows={2}
                      className="w-full p-3 border border-slate-300 rounded-lg text-sm"
                      value={physicalData.notes}
                      onChange={(e) => setPhysicalData({...physicalData, notes: e.target.value})}
                      placeholder="Notas adicionales..."
                    />
                  </div>
               </div>
            </div>
          )}

          {/* STEP 3: CHEMICAL */}
          {step === 3 && (
            <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm animate-in fade-in slide-in-from-right-4">
               <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                 <Activity className="text-purple-500"/> Análisis Fisicoquímico
               </h3>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                     <label className="block text-sm font-bold text-purple-900 mb-2 uppercase">Acidez Dornic (°D)</label>
                     <div className="relative">
                       <input 
                         type="number" step="0.1"
                         className="w-full p-4 text-2xl font-bold border border-purple-200 rounded-xl text-center focus:ring-4 focus:ring-purple-200 outline-none"
                         placeholder="0.0"
                         value={chemicalData.acidity || ''}
                         onChange={(e) => handleChemicalChange('acidity', parseFloat(e.target.value))}
                       />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400 font-bold">°D</span>
                     </div>
                     <p className="text-xs text-center mt-2 text-purple-700">
                       {chemicalData.acidity > 8 ? '⚠️ Excede límite (>8°D)' : '✅ Dentro de rango (1-8°D)'}
                     </p>
                  </div>

                  <div className="bg-pink-50 p-6 rounded-xl border border-pink-100">
                     <label className="block text-sm font-bold text-pink-900 mb-2 uppercase">Crematocrito (Kcal/L)</label>
                     <div className="relative">
                       <input 
                         type="number"
                         className="w-full p-4 text-2xl font-bold border border-pink-200 rounded-xl text-center focus:ring-4 focus:ring-pink-200 outline-none"
                         placeholder="0"
                         value={chemicalData.creamatocrit || ''}
                         onChange={(e) => handleChemicalChange('creamatocrit', parseFloat(e.target.value))}
                       />
                       <span className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-400 font-bold">Kcal/L</span>
                     </div>
                     <div className="mt-2 text-center">
                        <span className="inline-block px-2 py-1 bg-white rounded border border-pink-200 text-xs font-bold text-pink-700">
                          {chemicalData.classification}
                        </span>
                     </div>
                  </div>
               </div>
            </div>
          )}

        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
        <button 
          onClick={onCancel}
          className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
        >
          Cancelar
        </button>
        
        <div className="flex gap-3">
          {step > 1 && (
             <button 
               onClick={() => setStep(p => p - 1)}
               className="px-6 py-2 text-slate-600 font-medium border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-2"
             >
               <ArrowLeft size={16}/> Anterior
             </button>
          )}

          {step < 3 ? (
             <button 
               onClick={() => setStep(p => p + 1)}
               // Block step 1 if not confirmed
               disabled={step === 1 && !holderData.done}
               className="px-6 py-2 bg-slate-800 text-white font-medium hover:bg-slate-700 rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Siguiente <ArrowRight size={16}/>
             </button>
          ) : (
             <button 
               onClick={finalizeProcess}
               className="px-8 py-2 bg-emerald-600 text-white font-bold hover:bg-emerald-700 rounded-lg shadow-md flex items-center gap-2"
             >
               <Save size={18}/> Finalizar Proceso
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisWizard;