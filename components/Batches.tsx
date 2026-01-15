import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Filter, Eye, FlaskConical, CheckCircle2, AlertCircle } from 'lucide-react';
import { MilkBatch, MilkStatus, MilkType, MilkJar, DonorType } from '../types';
import BatchWizard from './BatchWizard';
import BatchDetail from './BatchDetail';

// Mock Batches (Existing data)
const MOCK_BATCHES: MilkBatch[] = [
  { 
    id: '1', folio: 'LP-2024-05-20-001', type: 'Heteróloga', milkType: MilkType.COLOSTRUM, volumeTotalMl: 150,
    status: MilkStatus.RELEASED, creationDate: '2024-05-20', expirationDate: '2024-11-20',
    donors: [{id: '1', name: 'María G.'}, {id: '2', name: 'Ana L.'}], jarIds: ['101','102','103'], // IDs that don't conflict with new ones
    pasteurization: { date: '2024-05-20', tempCurve: [], responsible: 'Juan P.', completed: true }
  },
  { 
    id: '2', folio: 'LP-2024-05-25-002', type: 'Heteróloga', milkType: MilkType.MATURE, volumeTotalMl: 200,
    status: MilkStatus.QUARANTINE, creationDate: '2024-05-25',
    donors: [{id: '3', name: 'Rosa M.'}], jarIds: ['104'],
    pasteurization: { date: '2024-05-25', tempCurve: [], responsible: 'Juan P.', completed: true },
    microbiology: { sowingDate: '2024-05-25' }
  }
];

// Fallback data if localStorage is empty
const INITIAL_JARS_FALLBACK: MilkJar[] = [
  { 
    id: '1', folio: 'HO-2024-05-27-001', donorId: '1', donorName: 'María González Pérez', donorType: DonorType.HOMOLOGOUS_INTERNAL,
    volumeMl: 50, milkType: MilkType.COLOSTRUM, extractionDate: new Date().toISOString().split('T')[0], extractionTime: '08:30', extractionPlace: 'Lactario',
    receptionTemperature: 4.2, status: MilkStatus.RAW, history: [], clean: true, sealed: true, labeled: true
  },
  { 
    id: '2', folio: 'HO-2024-05-27-002', donorId: '2', donorName: 'Ana López Martínez', donorType: DonorType.HETEROLOGOUS,
    volumeMl: 120, milkType: MilkType.MATURE, extractionDate: new Date().toISOString().split('T')[0], extractionTime: '09:15', extractionPlace: 'Domicilio',
    receptionTemperature: 5.0, status: MilkStatus.RAW, history: [], clean: true, sealed: true, labeled: true
  }
];

type ViewState = 'LIST' | 'CREATE' | 'DETAIL';

const Batches: React.FC = () => {
  const [view, setView] = useState<ViewState>('LIST');
  
  // 1. Initialize Batches from localStorage (Source of Truth)
  const [batches, setBatches] = useState<MilkBatch[]>(() => {
    try {
      const saved = localStorage.getItem('app_batches');
      return saved ? JSON.parse(saved) : MOCK_BATCHES;
    } catch (e) {
      console.error("Error loading batches", e);
      return MOCK_BATCHES;
    }
  });

  const [selectedBatch, setSelectedBatch] = useState<MilkBatch | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // 2. Load Jars for the Wizard
  const [allJars, setAllJars] = useState<MilkJar[]>(() => {
    try {
      const saved = localStorage.getItem('app_jars');
      return saved ? JSON.parse(saved) : INITIAL_JARS_FALLBACK;
    } catch (e) {
      console.error("Error loading jars in Batches", e);
      return INITIAL_JARS_FALLBACK;
    }
  });

  // Compute Available Jars
  const availableJars = useMemo(() => {
    const usedJarIds = new Set(batches.flatMap(b => b.jarIds));
    return allJars.filter(jar => {
      const isUsed = usedJarIds.has(jar.id);
      const isStatusValid = [MilkStatus.RAW, MilkStatus.VERIFIED, MilkStatus.ANALYZED].includes(jar.status);
      return !isUsed && isStatusValid;
    });
  }, [batches, allJars]);

  // Persist Batches whenever they change
  useEffect(() => {
    localStorage.setItem('app_batches', JSON.stringify(batches));
  }, [batches]);

  const handleCreateBatch = (newBatch: MilkBatch) => {
    setBatches([newBatch, ...batches]);
    // Also update jars status in localStorage to "IN_BATCH" if needed, 
    // but for now relying on availableJars logic is safer.
    setView('LIST');
  };

  const handleUpdateBatch = (updated: MilkBatch) => {
    setBatches(batches.map(b => b.id === updated.id ? updated : b));
    setSelectedBatch(updated);
  };

  const getStatusColor = (status: MilkStatus) => {
    switch (status) {
      case MilkStatus.RAW: return 'bg-blue-100 text-blue-700 border-blue-200';
      case MilkStatus.QUARANTINE: return 'bg-amber-100 text-amber-700 border-amber-200';
      case MilkStatus.RELEASED: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case MilkStatus.DISCARDED: return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredBatches = batches.filter(b => 
    b.folio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (view === 'CREATE') {
    return (
      <BatchWizard 
        availableJars={availableJars}
        onComplete={handleCreateBatch} 
        onCancel={() => setView('LIST')} 
      />
    );
  }

  if (view === 'DETAIL' && selectedBatch) {
    return <BatchDetail batch={selectedBatch} onBack={() => setView('LIST')} onUpdate={handleUpdateBatch} />;
  }

  return (
    <div className="space-y-6">
       {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Control de Lotes</h2>
          <p className="text-slate-500">Administración y seguimiento de procesos de pasteurización</p>
        </div>
        <button 
          onClick={() => setView('CREATE')}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={20} />
          Nuevo Lote
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por número de lote..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-600 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Folio</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Volumen</th>
                <th className="px-6 py-4 text-center">Frascos</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredBatches.map(batch => (
                <tr key={batch.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-700">
                    {batch.folio}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">{batch.type}</span>
                      <span className="text-xs text-slate-500">{batch.milkType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">
                    {batch.volumeTotalMl} mL
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold border border-slate-200">
                      {batch.jarIds.length}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(batch.status)}`}>
                        {batch.status === MilkStatus.RAW && <FlaskConical size={10} />}
                        {batch.status === MilkStatus.QUARANTINE && <FlaskConical size={10} />}
                        {batch.status === MilkStatus.RELEASED && <CheckCircle2 size={10} />}
                        {batch.status === MilkStatus.DISCARDED && <AlertCircle size={10} />}
                        {batch.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {batch.creationDate.split('T')[0]}
                  </td>
                  <td className="px-6 py-4 text-center">
                     <button 
                       onClick={() => { setSelectedBatch(batch); setView('DETAIL'); }}
                       className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                       title="Ver detalle"
                     >
                        <Eye size={18} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredBatches.length === 0 && (
             <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                <FlaskConical size={48} className="mb-4 opacity-20" />
                <p>No se encontraron lotes registrados.</p>
             </div>
          )}
        </div>
        
        {/* Simple Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
           <span>Total: {filteredBatches.length} registros</span>
        </div>
      </div>
    </div>
  );
};

export default Batches;