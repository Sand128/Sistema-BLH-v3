import React, { useState } from 'react';
import { Plus, Search, Filter, PackageCheck, FlaskConical, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import { MilkBatch, MilkStatus, MilkType } from '../types';
import BatchWizard from './BatchWizard';
import BatchDetail from './BatchDetail';

// Mock Batches
const MOCK_BATCHES: MilkBatch[] = [
  { 
    id: '1', folio: 'LP-2024-05-20-001', type: 'Heteróloga', milkType: MilkType.COLOSTRUM, volumeTotalMl: 150,
    status: MilkStatus.RELEASED, creationDate: '2024-05-20', expirationDate: '2024-11-20',
    donors: [{id: '1', name: 'María G.'}, {id: '2', name: 'Ana L.'}], jarIds: ['1','2','3'],
    pasteurization: { date: '2024-05-20', tempCurve: [], responsible: 'Juan P.', completed: true }
  },
  { 
    id: '2', folio: 'LP-2024-05-25-002', type: 'Heteróloga', milkType: MilkType.MATURE, volumeTotalMl: 200,
    status: MilkStatus.QUARANTINE, creationDate: '2024-05-25',
    donors: [{id: '3', name: 'Rosa M.'}], jarIds: ['4'],
    pasteurization: { date: '2024-05-25', tempCurve: [], responsible: 'Juan P.', completed: true },
    microbiology: { sowingDate: '2024-05-25' }
  }
];

type ViewState = 'LIST' | 'CREATE' | 'DETAIL';

const Batches: React.FC = () => {
  const [view, setView] = useState<ViewState>('LIST');
  const [batches, setBatches] = useState<MilkBatch[]>(MOCK_BATCHES);
  const [selectedBatch, setSelectedBatch] = useState<MilkBatch | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateBatch = (newBatch: MilkBatch) => {
    setBatches([newBatch, ...batches]);
    setView('LIST');
  };

  const handleUpdateBatch = (updated: MilkBatch) => {
    setBatches(batches.map(b => b.id === updated.id ? updated : b));
    setSelectedBatch(updated);
  };

  const getStatusColor = (status: MilkStatus) => {
    switch (status) {
      case MilkStatus.QUARANTINE: return 'bg-amber-100 text-amber-700';
      case MilkStatus.RELEASED: return 'bg-emerald-100 text-emerald-700';
      case MilkStatus.DISCARDED: return 'bg-red-100 text-red-700 line-through';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredBatches = batches.filter(b => 
    b.folio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'CREATE') {
    return <BatchWizard onComplete={handleCreateBatch} onCancel={() => setView('LIST')} />;
  }

  if (view === 'DETAIL' && selectedBatch) {
    return <BatchDetail batch={selectedBatch} onBack={() => setView('LIST')} onUpdate={handleUpdateBatch} />;
  }

  return (
    <div className="space-y-6">
       {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Gestión de Lotes</h2>
          <p className="text-slate-500">Pasteurización, Cuarentena y Liberación</p>
        </div>
        <button 
          onClick={() => setView('CREATE')}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={20} />
          Formar Lote
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-xs text-slate-500 uppercase font-bold">En Cuarentena</p>
               <p className="text-2xl font-bold text-amber-500">{batches.filter(b => b.status === MilkStatus.QUARANTINE).length}</p>
            </div>
            <FlaskConical className="text-amber-200" size={32} />
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-xs text-slate-500 uppercase font-bold">Liberados (Mes)</p>
               <p className="text-2xl font-bold text-emerald-600">{batches.filter(b => b.status === MilkStatus.RELEASED).length}</p>
            </div>
            <CheckCircle2 className="text-emerald-200" size={32} />
         </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por folio..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <Filter size={18} />
            Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium text-sm">
              <tr>
                <th className="px-6 py-4">Folio</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Donantes</th>
                <th className="px-6 py-4">Volumen</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredBatches.map(batch => (
                <tr 
                  key={batch.id}
                  onClick={() => { setSelectedBatch(batch); setView('DETAIL'); }}
                  className="hover:bg-slate-50 cursor-pointer group"
                >
                  <td className="px-6 py-4 font-mono font-medium text-slate-700">{batch.folio}</td>
                  <td className="px-6 py-4">{batch.type} <span className="text-slate-400">({batch.milkType})</span></td>
                  <td className="px-6 py-4">
                     <div className="flex -space-x-2">
                        {batch.donors.slice(0,3).map((d,i) => (
                           <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] text-slate-600 font-bold" title={d.name}>
                              {d.name.charAt(0)}
                           </div>
                        ))}
                     </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-600">{batch.volumeTotalMl} mL</td>
                  <td className="px-6 py-4 text-slate-500">{batch.creationDate.split('T')[0]}</td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(batch.status)}`}>
                        {batch.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                     <ChevronRight size={18} className="text-slate-300 group-hover:text-orange-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBatches.length === 0 && (
             <div className="p-12 text-center text-slate-400">No se encontraron lotes.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Batches;