import React, { useState, useMemo } from 'react';
import { Trash2, AlertTriangle, Filter, Search, CheckCircle2, Milk, FlaskConical, Syringe, Biohazard } from 'lucide-react';
import { MilkJar, MilkBatch, AdministrationRecord, MilkStatus } from '../types';

// Unified Interface for Display
interface WasteItem {
  id: string;
  folio: string;
  source: 'Frasco' | 'Lote' | 'Toma';
  volume: number;
  reason: string;
  date: string;
  responsible: string;
  status: 'Pendiente' | 'Procesado'; // Local UI status for "Disposal Confirmation"
}

const WasteRegistry: React.FC = () => {
  const [filterSource, setFilterSource] = useState<'ALL' | 'Frasco' | 'Lote' | 'Toma'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());

  // 1. Fetch Data from LocalStorage (Consolidation)
  const wasteData = useMemo(() => {
    const items: WasteItem[] = [];

    try {
      // A. JARS (Status = DISCARDED)
      const jars: MilkJar[] = JSON.parse(localStorage.getItem('app_jars') || '[]');
      jars.filter(j => j.status === MilkStatus.DISCARDED).forEach(j => {
        items.push({
          id: j.id,
          folio: j.folio,
          source: 'Frasco',
          volume: j.volumeMl,
          reason: j.rejectionReason || 'Falla en verificación/análisis',
          date: j.extractionDate, // Or discard date if available
          responsible: j.history[j.history.length-1]?.user || 'Sistema',
          status: 'Pendiente'
        });
      });

      // B. BATCHES (Status = DISCARDED)
      const batches: MilkBatch[] = JSON.parse(localStorage.getItem('app_batches') || '[]');
      batches.filter(b => b.status === MilkStatus.DISCARDED).forEach(b => {
        items.push({
          id: b.id,
          folio: b.folio,
          source: 'Lote',
          volume: b.volumeTotalMl,
          reason: 'Fallo Microbiológico / Fisicoquímico',
          date: b.creationDate,
          responsible: b.pasteurization?.responsible || 'Lab',
          status: 'Pendiente'
        });
      });

      // C. ADMINISTRATION (volumeDiscarded > 0)
      const admins: AdministrationRecord[] = JSON.parse(localStorage.getItem('app_admin_records') || '[]');
      admins.filter(a => a.volumeDiscarded > 0).forEach(a => {
        items.push({
          id: a.id,
          folio: a.batchFolio, // Showing Batch Folio as ref
          source: 'Toma',
          volume: a.volumeDiscarded,
          reason: a.discardReason || 'Merma operativa',
          date: a.timestamp,
          responsible: a.responsible,
          status: 'Pendiente'
        });
      });

    } catch (e) {
      console.error("Error loading waste data", e);
    }

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, []); // Re-calculate on mount

  // Filter Logic
  const filteredItems = wasteData.filter(item => {
    const matchesSource = filterSource === 'ALL' || item.source === filterSource;
    const matchesSearch = item.folio.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSource && matchesSearch;
  });

  // Action Handler
  const handleConfirmDisposal = (id: string) => {
    if(confirm("¿Confirmar disposición final de este residuo (Incineración/Biopeligroso)?")) {
      setProcessedIds(prev => new Set(prev).add(id));
    }
  };

  // Icon Helper
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'Frasco': return <Milk size={16} className="text-blue-500"/>;
      case 'Lote': return <FlaskConical size={16} className="text-purple-500"/>;
      case 'Toma': return <Syringe size={16} className="text-emerald-500"/>;
      default: return <Trash2 size={16}/>;
    }
  };

  // Stats
  const totalVolume = filteredItems.reduce((sum, i) => sum + i.volume, 0);

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Biohazard className="text-red-600" /> 
            Gestión de Desecho y Mermas
          </h2>
          <p className="text-slate-500">Registro consolidado de volúmenes no aptos o descartados.</p>
        </div>
        <div className="bg-red-50 px-4 py-2 rounded-lg border border-red-100 flex flex-col items-end">
           <span className="text-xs font-bold text-red-800 uppercase">Volumen Total Desechado</span>
           <span className="text-xl font-bold text-red-600">{totalVolume} mL</span>
        </div>
      </div>

      {/* Filters Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
           
           <div className="flex gap-2">
             {['ALL', 'Frasco', 'Lote', 'Toma'].map(type => (
               <button
                 key={type}
                 onClick={() => setFilterSource(type as any)}
                 className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                   filterSource === type 
                     ? 'bg-slate-800 text-white border-slate-800' 
                     : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                 }`}
               >
                 {type === 'ALL' ? 'Todos' : type}
               </button>
             ))}
           </div>

           <div className="relative w-full max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Buscar folio o motivo..." 
               className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100 uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Origen</th>
                <th className="px-6 py-4">Folio Referencia</th>
                <th className="px-6 py-4">Volumen</th>
                <th className="px-6 py-4">Motivo Rechazo/Baja</th>
                <th className="px-6 py-4">Fecha Evento</th>
                <th className="px-6 py-4 text-center">Estado Disposición</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map(item => {
                const isProcessed = processedIds.has(item.id);
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-slate-700">
                        {getSourceIcon(item.source)}
                        {item.source}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600">
                      {item.folio}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {item.volume} mL
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-red-700 font-medium bg-red-50 px-2 py-1 rounded border border-red-100 inline-block max-w-[200px] truncate" title={item.reason}>
                        {item.reason}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(item.date).toLocaleDateString()} <span className="text-xs opacity-70">{new Date(item.date).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       {isProcessed ? (
                         <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                           <CheckCircle2 size={12}/> Procesado
                         </span>
                       ) : (
                         <button 
                           onClick={() => handleConfirmDisposal(item.id)}
                           className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1 rounded-full transition-colors"
                         >
                           <Trash2 size={12}/> Confirmar
                         </button>
                       )}
                    </td>
                  </tr>
                );
              })}
              
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <AlertTriangle size={32} className="mx-auto mb-2 opacity-20"/>
                    <p>No se encontraron registros de desecho.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WasteRegistry;