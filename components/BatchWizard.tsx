import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, Beaker, CheckCircle2, 
  Thermometer, Flame, Clock, Users, Save, X, AlertTriangle 
} from 'lucide-react';
import { MilkJar, MilkStatus, MilkBatch, MilkType, DonorType } from '../types';

// Mock Approved Jars (Ready for batching)
const MOCK_APPROVED_JARS: MilkJar[] = [
  { 
    id: '1', folio: 'HO-001', donorId: '1', donorName: 'María G.', donorType: DonorType.HOMOLOGOUS_INTERNAL,
    volumeMl: 50, milkType: MilkType.COLOSTRUM, extractionDate: '2024-05-27', extractionTime: '10:00', extractionPlace: 'Lactario',
    receptionTemperature: 4, status: MilkStatus.ANALYZED, history: []
  },
  { 
    id: '2', folio: 'HO-002', donorId: '1', donorName: 'María G.', donorType: DonorType.HOMOLOGOUS_INTERNAL,
    volumeMl: 50, milkType: MilkType.COLOSTRUM, extractionDate: '2024-05-27', extractionTime: '11:00', extractionPlace: 'Lactario',
    receptionTemperature: 4, status: MilkStatus.ANALYZED, history: []
  },
  { 
    id: '3', folio: 'HO-003', donorId: '2', donorName: 'Ana L.', donorType: DonorType.HETEROLOGOUS,
    volumeMl: 50, milkType: MilkType.COLOSTRUM, extractionDate: '2024-05-26', extractionTime: '09:00', extractionPlace: 'Domicilio',
    receptionTemperature: 5, status: MilkStatus.ANALYZED, history: []
  },
  { 
    id: '4', folio: 'HO-004', donorId: '3', donorName: 'Rosa M.', donorType: DonorType.HETEROLOGOUS,
    volumeMl: 120, milkType: MilkType.MATURE, extractionDate: '2024-05-25', extractionTime: '08:00', extractionPlace: 'Domicilio',
    receptionTemperature: 4, status: MilkStatus.ANALYZED, history: []
  },
];

interface BatchWizardProps {
  onComplete: (batch: MilkBatch) => void;
  onCancel: () => void;
}

const BatchWizard: React.FC<BatchWizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [selectedJars, setSelectedJars] = useState<MilkJar[]>([]);
  const [filterType, setFilterType] = useState<MilkType>(MilkType.COLOSTRUM);
  
  // Pasteurization State
  const [pTime, setPTime] = useState(0); // minutes sim
  const [isPasteurizing, setIsPasteurizing] = useState(false);
  const [tempCurve, setTempCurve] = useState<{time: number, temp: number}[]>([]);

  // STEP 1: VALIDATION LOGIC
  const uniqueDonors = Array.from(new Set(selectedJars.map(j => j.donorId)));
  const totalVolume = selectedJars.reduce((acc, j) => acc + j.volumeMl, 0);
  const isDonorLimitExceeded = uniqueDonors.length > 3;

  const toggleJar = (jar: MilkJar) => {
    if (selectedJars.find(j => j.id === jar.id)) {
      setSelectedJars(prev => prev.filter(j => j.id !== jar.id));
    } else {
      if (jar.milkType !== filterType && selectedJars.length > 0) {
        alert("No se pueden mezclar tipos de leche diferentes.");
        return;
      }
      setSelectedJars(prev => [...prev, jar]);
    }
  };

  // STEP 2: PASTEURIZATION SIMULATION
  useEffect(() => {
    let interval: any;
    if (isPasteurizing && pTime < 30) {
      interval = setInterval(() => {
        setPTime(prev => {
          const next = prev + 5;
          // Simulate temp curve: starts low, reaches target 62.5
          const newTemp = next === 0 ? 25 : (next >= 5 ? 62.5 + (Math.random() * 0.4 - 0.2) : 40);
          setTempCurve(curr => [...curr, { time: next, temp: parseFloat(newTemp.toFixed(1)) }]);
          return next;
        });
      }, 1000); // Speed up: 1s = 5min process
    } else if (pTime >= 30) {
      setIsPasteurizing(false);
    }
    return () => clearInterval(interval);
  }, [isPasteurizing, pTime]);

  const startPasteurization = () => {
    setTempCurve([{ time: 0, temp: 25.0 }]);
    setPTime(0);
    setIsPasteurizing(true);
  };

  // FINALIZE
  const handleFinish = () => {
    const isHeterologous = selectedJars.some(j => j.donorType === DonorType.HETEROLOGOUS);
    const today = new Date();
    
    // Expiration: 6 months for Heterologous Pasteurized
    const expDate = new Date(today);
    expDate.setMonth(today.getMonth() + 6);

    const newBatch: MilkBatch = {
      id: Math.random().toString(36).substr(2, 9),
      folio: `LP-${today.toISOString().split('T')[0]}-${Math.floor(Math.random() * 100)}`,
      donors: uniqueDonors.map(id => ({ id, name: selectedJars.find(j => j.donorId === id)?.donorName || '?' })),
      jarIds: selectedJars.map(j => j.id),
      type: isHeterologous ? 'Heteróloga' : 'Homóloga',
      milkType: filterType,
      volumeTotalMl: totalVolume,
      status: MilkStatus.QUARANTINE, // Starts in Quarantine after Pasteurization
      creationDate: today.toISOString(),
      expirationDate: expDate.toISOString(),
      pasteurization: {
        date: today.toISOString(),
        tempCurve,
        responsible: 'Q.F.B. Actual',
        completed: true
      },
      microbiology: {
        sowingDate: today.toISOString(), // Assuming sowing happens immediately after
      }
    };
    onComplete(newBatch);
  };

  const filteredJars = MOCK_APPROVED_JARS.filter(j => j.milkType === filterType);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Flame className="text-orange-500" />
            Formación y Pasteurización
          </h2>
          <div className="flex items-center gap-2 mt-1">
             <div className={`h-2 w-8 rounded-full ${step >= 1 ? 'bg-orange-500' : 'bg-slate-300'}`}></div>
             <div className={`h-2 w-8 rounded-full ${step >= 2 ? 'bg-orange-500' : 'bg-slate-300'}`}></div>
          </div>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        
        {/* STEP 1: POOLING / SELECTION */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4">
             <div className="flex flex-col md:flex-row gap-6 mb-6">
                {/* Filters & Stats */}
                <div className="w-full md:w-1/3 space-y-4">
                   <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipo de Leche</label>
                      <select 
                        className="w-full p-2 border border-slate-300 rounded-lg mb-4"
                        value={filterType}
                        onChange={(e) => {
                          setFilterType(e.target.value as MilkType);
                          setSelectedJars([]); // Reset selection on type change
                        }}
                      >
                        {Object.values(MilkType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                           <span className="text-slate-600">Frascos Seleccionados:</span>
                           <span className="font-bold">{selectedJars.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-slate-600">Volumen Total:</span>
                           <span className="font-bold text-blue-600">{totalVolume} mL</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-slate-600">Donantes (Max 3):</span>
                           <span className={`font-bold ${isDonorLimitExceeded ? 'text-red-600' : 'text-emerald-600'}`}>
                             {uniqueDonors.length} / 3
                           </span>
                        </div>
                      </div>

                      {isDonorLimitExceeded && (
                        <div className="mt-4 p-2 bg-red-50 text-red-700 text-xs rounded border border-red-100 flex gap-2">
                           <AlertTriangle size={14}/> Límite de donantes excedido.
                        </div>
                      )}
                   </div>
                </div>

                {/* Jar Grid */}
                <div className="w-full md:w-2/3">
                   <h3 className="font-bold text-slate-700 mb-3">Frascos Aprobados Disponibles</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredJars.map(jar => {
                        const isSelected = selectedJars.some(j => j.id === jar.id);
                        return (
                          <div 
                            key={jar.id}
                            onClick={() => toggleJar(jar)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              isSelected 
                                ? 'bg-orange-50 border-orange-500 shadow-sm ring-1 ring-orange-500' 
                                : 'bg-white border-slate-200 hover:border-orange-300'
                            }`}
                          >
                             <div className="flex justify-between items-start mb-1">
                                <span className="font-mono text-xs font-bold text-slate-600">{jar.folio}</span>
                                {isSelected && <CheckCircle2 size={16} className="text-orange-600"/>}
                             </div>
                             <div className="text-sm font-medium text-slate-800">{jar.donorName}</div>
                             <div className="flex justify-between mt-2 text-xs text-slate-500">
                               <span>{jar.volumeMl} mL</span>
                               <span>{jar.extractionDate}</span>
                             </div>
                          </div>
                        );
                      })}
                      {filteredJars.length === 0 && (
                        <div className="col-span-2 text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                          No hay frascos aprobados de este tipo.
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* STEP 2: PASTEURIZATION */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 max-w-3xl mx-auto">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                <div className="flex justify-between items-start border-b border-slate-100 pb-4 mb-4">
                   <div>
                     <h3 className="text-lg font-bold text-slate-800">Método Holder</h3>
                     <p className="text-slate-500 text-sm">Objetivo: 62.5°C por 30 minutos</p>
                   </div>
                   <div className="text-right">
                      <div className="text-3xl font-mono font-bold text-slate-800">
                        {pTime}<span className="text-sm text-slate-400">min</span> / 30
                      </div>
                   </div>
                </div>

                {/* Graph Simulation */}
                <div className="h-48 bg-slate-50 rounded-lg border border-slate-200 relative overflow-hidden flex items-end px-4 gap-1">
                   {tempCurve.map((point, i) => (
                     <div 
                       key={i} 
                       className="bg-orange-400 w-full max-w-[20px] rounded-t opacity-80 hover:opacity-100 transition-all relative group"
                       style={{ height: `${(point.temp / 70) * 100}%` }}
                     >
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                         {point.temp}°C
                       </div>
                     </div>
                   ))}
                   {/* Target Line */}
                   <div className="absolute top-[10.7%] left-0 right-0 border-t border-dashed border-red-400 opacity-50 pointer-events-none"></div> 
                   <span className="absolute top-[7%] right-2 text-[10px] text-red-500 font-bold">62.5°C</span>
                </div>
                
                <div className="mt-4 flex justify-center">
                   {!isPasteurizing && pTime === 0 && (
                     <button 
                       onClick={startPasteurization}
                       className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg shadow-md flex items-center gap-2"
                     >
                       <Flame size={20} /> Iniciar Ciclo
                     </button>
                   )}
                   {isPasteurizing && (
                     <div className="flex items-center gap-2 text-orange-600 font-bold animate-pulse">
                       <Clock size={20} /> Procesando...
                     </div>
                   )}
                   {!isPasteurizing && pTime >= 30 && (
                      <div className="flex items-center gap-2 text-emerald-600 font-bold">
                        <CheckCircle2 size={24} /> Ciclo Completado Exitosamente
                      </div>
                   )}
                </div>
             </div>
          </div>
        )}

      </div>

      {/* Footer */}
      <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
        <button onClick={onCancel} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">
          Cancelar
        </button>
        
        <div className="flex gap-3">
          {step === 1 && (
            <button 
              onClick={() => setStep(2)}
              disabled={selectedJars.length === 0 || isDonorLimitExceeded}
              className="px-6 py-2 bg-slate-800 text-white font-medium hover:bg-slate-700 rounded-lg shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              Continuar <ArrowRight size={16}/>
            </button>
          )}
          
          {step === 2 && (
            <button 
              onClick={handleFinish}
              disabled={pTime < 30}
              className="px-8 py-2 bg-emerald-600 text-white font-bold hover:bg-emerald-700 rounded-lg shadow-md disabled:opacity-50 disabled:bg-slate-300 flex items-center gap-2"
            >
              <Save size={18} /> Finalizar Lote
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchWizard;