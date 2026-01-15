import React, { useState, useEffect } from 'react';
import { History, TestTube2, AlertCircle, FlaskConical, Play } from 'lucide-react';
import { MilkBatch, MilkStatus, MilkType } from '../types';
import AnalysisWizard from './AnalysisWizard';

// Mock Batches as fallback
const MOCK_READY_BATCHES: MilkBatch[] = [
  { 
    id: 'B1', folio: 'LP-2024-05-27-001', type: 'Heteróloga', milkType: MilkType.COLOSTRUM, volumeTotalMl: 450,
    status: MilkStatus.RAW, creationDate: '2024-05-27', donors: [{id:'1', name:'María G.'}], jarIds: ['1','2']
  },
  { 
    id: 'B2', folio: 'LP-2024-05-27-002', type: 'Homóloga', milkType: MilkType.MATURE, volumeTotalMl: 1200,
    status: MilkStatus.RAW, creationDate: '2024-05-27', donors: [{id:'2', name:'Ana L.'}], jarIds: ['3']
  }
];

const Analysis: React.FC = () => {
  const [view, setView] = useState<'LIST' | 'WIZARD'>('LIST');
  const [selectedBatch, setSelectedBatch] = useState<MilkBatch | null>(null);
  
  // 1. Fetch batches from localStorage and Filter for RAW status
  const [batches, setBatches] = useState<MilkBatch[]>(() => {
    try {
      const saved = localStorage.getItem('app_batches');
      const allBatches = saved ? JSON.parse(saved) : MOCK_READY_BATCHES;
      // ONLY show batches that are waiting for analysis (RAW)
      return allBatches.filter((b: MilkBatch) => b.status === MilkStatus.RAW);
    } catch (e) {
      console.error("Error loading batches in Analysis", e);
      return MOCK_READY_BATCHES;
    }
  });
  
  // Stats calculation
  const [stats, setStats] = useState({
    pending: 0,
    processedToday: 5
  });

  useEffect(() => {
    setStats(prev => ({ ...prev, pending: batches.length }));
  }, [batches]);

  const startAnalysis = (batch: MilkBatch) => {
    setSelectedBatch(batch);
    setView('WIZARD');
  };

  const handleAnalysisComplete = (processedBatch: MilkBatch) => {
    // 1. Update the MAIN database (localStorage)
    try {
      const saved = localStorage.getItem('app_batches');
      if (saved) {
        const allBatches = JSON.parse(saved);
        const updatedAll = allBatches.map((b: MilkBatch) => 
          b.id === processedBatch.id ? processedBatch : b
        );
        localStorage.setItem('app_batches', JSON.stringify(updatedAll));
      }
    } catch (e) {
      console.error("Failed to update global batch storage", e);
    }

    // 2. Remove from LOCAL pending list (since it's no longer RAW)
    setBatches(prev => prev.filter(b => b.id !== processedBatch.id));
    setStats(prev => ({ ...prev, processedToday: prev.processedToday + 1 }));
    
    setSelectedBatch(null);
    setView('LIST');
  };

  const getMilkTypeStyles = (type: MilkType) => {
    switch (type) {
      case MilkType.COLOSTRUM: 
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case MilkType.TRANSITION:
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case MilkType.MATURE:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (view === 'WIZARD' && selectedBatch) {
    return (
      <AnalysisWizard 
        batch={selectedBatch}
        onComplete={handleAnalysisComplete}
        onCancel={() => setView('LIST')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Módulo de Análisis</h2>
          <p className="text-slate-500">Gestión integral: Pasteurización, Físico y Fisicoquímico</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2">
             <History size={18} /> Historial
           </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 uppercase font-bold">Lotes Pendientes</p>
             <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
           </div>
           <div className="p-3 bg-amber-100 rounded-full text-amber-600">
             <FlaskConical size={24} />
           </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 uppercase font-bold">Procesados Hoy</p>
             <p className="text-2xl font-bold text-emerald-600">{stats.processedToday}</p>
           </div>
           <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
             <TestTube2 size={24} />
           </div>
         </div>
      </div>

      {/* BATCH LIST */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <FlaskConical size={18} className="text-slate-400"/>
            Lotes Listos para Procesamiento (Estado: Cruda)
          </h3>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-white text-slate-500 text-sm border-b border-slate-100">
             <tr>
               <th className="px-6 py-3">Folio Lote</th>
               <th className="px-6 py-3">Donantes</th>
               <th className="px-6 py-3">Volumen • Tipo</th>
               <th className="px-6 py-3">Fecha Formación</th>
               <th className="px-6 py-3 text-right">Acción</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
             {batches.map(batch => (
               <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                 <td className="px-6 py-4 font-mono font-bold text-slate-700">{batch.folio}</td>
                 <td className="px-6 py-4">
                   <div className="flex flex-col">
                     <span className="font-medium text-slate-800">{batch.donors.length} participantes</span>
                     <span className="text-xs text-slate-400 truncate max-w-[200px]">
                       {batch.donors.map(d => d.name).join(', ')}
                     </span>
                   </div>
                 </td>
                 <td className="px-6 py-4">
                   <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getMilkTypeStyles(batch.milkType)}`}>
                      <span className="font-bold">{batch.volumeTotalMl} mL</span>
                      <span className="text-xs opacity-60">•</span>
                      <span className="text-xs font-bold uppercase tracking-wider">{batch.milkType}</span>
                   </div>
                 </td>
                 <td className="px-6 py-4 text-slate-500">
                   {new Date(batch.creationDate).toLocaleDateString()}
                 </td>
                 <td className="px-6 py-4 text-right">
                   <button 
                     onClick={() => startAnalysis(batch)}
                     className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors text-xs"
                   >
                     <Play size={14} fill="currentColor" /> Iniciar Proceso
                   </button>
                 </td>
               </tr>
             ))}
             {batches.length === 0 && (
               <tr>
                 <td colSpan={5} className="p-12 text-center text-slate-400">
                   <div className="flex flex-col items-center gap-2">
                     <AlertCircle size={32} className="opacity-20"/>
                     <p>No hay lotes pendientes de análisis.</p>
                     <p className="text-xs">Cree nuevos lotes en el módulo "Recolección &gt; Lotes"</p>
                   </div>
                 </td>
               </tr>
             )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Analysis;