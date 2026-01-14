import React, { useState } from 'react';
import { Plus, Search, Filter, TestTube2, AlertCircle, History, Check, X } from 'lucide-react';
import { MilkJar, MilkStatus, DonorType, MilkType } from '../types';
import AnalysisWizard from './AnalysisWizard';

// Mock Data - Simulating Jars ready for analysis (Status: VERIFIED)
const MOCK_VERIFIED_JARS: MilkJar[] = [
  { 
    id: '1', folio: 'HO-2024-05-27-001', donorId: '1', donorName: 'María González', donorType: DonorType.HOMOLOGOUS_INTERNAL,
    volumeMl: 50, milkType: MilkType.COLOSTRUM, extractionDate: '2024-05-27', extractionTime: '14:30', extractionPlace: 'Lactario',
    receptionTemperature: 4.2, status: MilkStatus.VERIFIED, history: []
  },
  { 
    id: '2', folio: 'HO-2024-05-27-002', donorId: '1', donorName: 'María González', donorType: DonorType.HOMOLOGOUS_INTERNAL,
    volumeMl: 60, milkType: MilkType.COLOSTRUM, extractionDate: '2024-05-27', extractionTime: '10:00', extractionPlace: 'Lactario',
    receptionTemperature: 3.8, status: MilkStatus.VERIFIED, history: []
  },
  { 
    id: '4', folio: 'HE-2024-05-27-004', donorId: '3', donorName: 'Lucía Ruiz', donorType: DonorType.HETEROLOGOUS,
    volumeMl: 120, milkType: MilkType.MATURE, extractionDate: '2024-05-26', extractionTime: '18:30', extractionPlace: 'Domicilio',
    receptionTemperature: 4.5, status: MilkStatus.VERIFIED, history: []
  },
  { 
    id: '5', folio: 'HO-2024-05-27-005', donorId: '1', donorName: 'María González', donorType: DonorType.HOMOLOGOUS_INTERNAL,
    volumeMl: 40, milkType: MilkType.COLOSTRUM, extractionDate: '2024-05-27', extractionTime: '15:30', extractionPlace: 'Lactario',
    receptionTemperature: 4.0, status: MilkStatus.VERIFIED, history: []
  }
];

const Analysis: React.FC = () => {
  const [view, setView] = useState<'LIST' | 'WIZARD'>('LIST');
  const [jars, setJars] = useState<MilkJar[]>(MOCK_VERIFIED_JARS);
  const [selectedJarIds, setSelectedJarIds] = useState<string[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]); // simplified for history

  const handleSelectionChange = (id: string) => {
    setSelectedJarIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const startAnalysis = () => {
    if (selectedJarIds.length === 0) return;
    setView('WIZARD');
  };

  const handleAnalysisComplete = (analyzedResults: MilkJar[]) => {
    // In a real app, this would push updates to backend
    // For now, we "remove" them from the pending list and add to history log
    
    // 1. Remove analyzed jars from the main pending list
    setJars(prev => prev.filter(j => !selectedJarIds.includes(j.id)));

    // 2. Add to history mock
    setAnalysisHistory(prev => [{
      id: Math.random().toString(),
      date: new Date().toISOString(),
      jarsCount: analyzedResults.length,
      passed: analyzedResults.filter(j => j.status === MilkStatus.ANALYZED).length,
      rejected: analyzedResults.filter(j => j.status === MilkStatus.DISCARDED).length,
      details: analyzedResults
    }, ...prev]);

    setSelectedJarIds([]);
    setView('LIST');
  };

  if (view === 'WIZARD') {
    const selectedJarsObjects = jars.filter(j => selectedJarIds.includes(j.id));
    return (
      <AnalysisWizard 
        selectedJars={selectedJarsObjects}
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
          <h2 className="text-2xl font-bold text-slate-800">Control de Calidad: Análisis</h2>
          <p className="text-slate-500">Validación fisicoquímica de frascos verificados</p>
        </div>
        <div className="flex gap-2">
           <button className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2">
             <History size={18} /> Historial
           </button>
           <button 
             onClick={startAnalysis}
             disabled={selectedJarIds.length === 0}
             className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <TestTube2 size={20} />
             Analizar ({selectedJarIds.length})
           </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 uppercase font-bold">Pendientes de Análisis</p>
             <p className="text-2xl font-bold text-slate-800">{jars.length}</p>
           </div>
           <div className="p-3 bg-purple-100 rounded-full text-purple-600">
             <TestTube2 size={24} />
           </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-xs text-slate-500 uppercase font-bold">Analizados Hoy</p>
             <p className="text-2xl font-bold text-emerald-600">{analysisHistory.reduce((acc, curr) => acc + curr.jarsCount, 0)}</p>
           </div>
           <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
             <Check size={24} />
           </div>
         </div>
      </div>

      {/* JAR SELECTION LIST */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-700">Frascos Disponibles para Análisis</h3>
          <div className="flex gap-2 text-sm text-slate-500">
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Calostro</span>
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Madura</span>
          </div>
        </div>
        
        <table className="w-full text-left">
          <thead className="bg-white text-slate-500 text-sm border-b border-slate-100">
             <tr>
               <th className="px-4 py-3 w-12 text-center">
                 <input type="checkbox" className="rounded" disabled /> 
               </th>
               <th className="px-4 py-3">Folio</th>
               <th className="px-4 py-3">Donadora</th>
               <th className="px-4 py-3">Volumen / Tipo</th>
               <th className="px-4 py-3">Tiempo Espera</th>
               <th className="px-4 py-3 text-right">Estado</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
             {jars.map(jar => (
               <tr key={jar.id} className={`hover:bg-slate-50 cursor-pointer ${selectedJarIds.includes(jar.id) ? 'bg-purple-50 hover:bg-purple-100' : ''}`} onClick={() => handleSelectionChange(jar.id)}>
                 <td className="px-4 py-3 text-center">
                   <input 
                     type="checkbox" 
                     className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                     checked={selectedJarIds.includes(jar.id)}
                     onChange={() => {}} 
                   />
                 </td>
                 <td className="px-4 py-3 font-medium text-slate-800">{jar.folio}</td>
                 <td className="px-4 py-3">{jar.donorName}</td>
                 <td className="px-4 py-3">
                   <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${jar.milkType === MilkType.COLOSTRUM ? 'bg-blue-500' : 'bg-orange-500'}`}></span>
                      {jar.volumeMl}mL • {jar.milkType}
                   </div>
                 </td>
                 <td className="px-4 py-3 text-slate-500">
                   2 horas
                 </td>
                 <td className="px-4 py-3 text-right">
                   <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
                     Verificado
                   </span>
                 </td>
               </tr>
             ))}
             {jars.length === 0 && (
               <tr>
                 <td colSpan={6} className="p-8 text-center text-slate-400">
                   <div className="flex flex-col items-center gap-2">
                     <AlertCircle size={24} />
                     No hay frascos verificados pendientes de análisis.
                   </div>
                 </td>
               </tr>
             )}
          </tbody>
        </table>
      </div>

      {/* History Log (Mini) */}
      {analysisHistory.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
           <h3 className="font-bold text-slate-800 mb-4">Lotes Recientes</h3>
           <div className="space-y-3">
             {analysisHistory.map((batch, idx) => (
               <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50">
                  <div>
                    <p className="font-bold text-slate-700">Lote Análisis #{batch.id.substr(0,4)}</p>
                    <p className="text-xs text-slate-500">{new Date(batch.date).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-emerald-600 font-bold">{batch.passed} Aprobados</span>
                    <span className="text-red-600 font-bold">{batch.rejected} Rechazados</span>
                  </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;