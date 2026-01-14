import React, { useState } from 'react';
import { Plus, Search, Filter, Milk, ArrowUpRight, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { MilkJar, MilkStatus, MilkType, DonorType } from '../types';
import JarForm from './JarForm';
import JarDetail from './JarDetail';

// Mock Data
const MOCK_JARS: MilkJar[] = [
  { 
    id: '1', folio: 'HO-2024-05-27-001', donorId: '1', donorName: 'María González', donorType: DonorType.HOMOLOGOUS_INTERNAL,
    volumeMl: 50, milkType: MilkType.COLOSTRUM, extractionDate: '2024-05-27', extractionTime: '14:30', extractionPlace: 'Lactario',
    receptionTemperature: 4.2, status: MilkStatus.RAW, history: []
  },
  { 
    id: '2', folio: 'HO-2024-05-27-002', donorId: '1', donorName: 'María González', donorType: DonorType.HOMOLOGOUS_INTERNAL,
    volumeMl: 60, milkType: MilkType.COLOSTRUM, extractionDate: '2024-05-27', extractionTime: '10:00', extractionPlace: 'Lactario',
    receptionTemperature: 3.8, status: MilkStatus.VERIFIED, history: []
  },
  { 
    id: '3', folio: 'HO-2024-05-26-015', donorId: '2', donorName: 'Ana López', donorType: DonorType.HETEROLOGOUS,
    volumeMl: 120, milkType: MilkType.MATURE, extractionDate: '2024-05-26', extractionTime: '08:00', extractionPlace: 'Domicilio',
    receptionTemperature: 6.5, status: MilkStatus.DISCARDED, rejectionReason: 'Temperatura elevada', history: []
  }
];

type ViewState = 'LIST' | 'CREATE' | 'DETAIL';

const Jars: React.FC = () => {
  const [view, setView] = useState<ViewState>('LIST');
  const [jars, setJars] = useState<MilkJar[]>(MOCK_JARS);
  const [selectedJar, setSelectedJar] = useState<MilkJar | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Handlers
  const handleCreateSuccess = (newJar: MilkJar) => {
    setJars([newJar, ...jars]);
    setView('LIST');
  };

  const handleUpdateJar = (updatedJar: MilkJar) => {
    setJars(jars.map(j => j.id === updatedJar.id ? updatedJar : j));
    setSelectedJar(updatedJar); // Keep showing detail with updated info
  };

  const filteredJars = jars.filter(j => 
    j.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.donorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Status Badge Helper
  const getStatusColor = (status: MilkStatus) => {
    switch (status) {
      case MilkStatus.RAW: return 'bg-blue-100 text-blue-700';
      case MilkStatus.VERIFIED: return 'bg-emerald-100 text-emerald-700';
      case MilkStatus.DISCARDED: return 'bg-red-100 text-red-700 line-through decoration-red-700/50';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // Render Logic
  if (view === 'CREATE') {
    return <JarForm onSuccess={handleCreateSuccess} onCancel={() => setView('LIST')} />;
  }

  if (view === 'DETAIL' && selectedJar) {
    return <JarDetail jar={selectedJar} onBack={() => setView('LIST')} onUpdate={handleUpdateJar} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Frascos de Leche</h2>
          <p className="text-slate-500">Gestión de extracciones y verificación inicial</p>
        </div>
        <button 
          onClick={() => setView('CREATE')}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={20} />
          Registrar Extracción
        </button>
      </div>

      {/* Stats Cards (Mini Dashboard for Module) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase">Pendientes Verificación</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-blue-600">{jars.filter(j => j.status === MilkStatus.RAW).length}</span>
            <AlertCircle className="text-blue-200" size={24} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
           <span className="text-xs text-slate-500 font-bold uppercase">Verificados Hoy</span>
           <div className="flex items-center justify-between mt-2">
            <span className="text-2xl font-bold text-emerald-600">{jars.filter(j => j.status === MilkStatus.VERIFIED).length}</span>
            <CheckCircle2 className="text-emerald-200" size={24} />
          </div>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por folio o donadora..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <Filter size={18} />
            Filtros
          </button>
        </div>

        {/* List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium text-sm">
              <tr>
                <th className="px-6 py-4">Folio</th>
                <th className="px-6 py-4">Donadora</th>
                <th className="px-6 py-4">Detalles</th>
                <th className="px-6 py-4">Fecha/Hora</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredJars.map((jar) => (
                <tr 
                  key={jar.id} 
                  onClick={() => { setSelectedJar(jar); setView('DETAIL'); }}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <span className="font-mono font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded text-sm group-hover:bg-pink-50 group-hover:text-pink-700 transition-colors">
                      {jar.folio}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{jar.donorName}</div>
                    <div className="text-xs text-slate-500">{jar.donorType}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Milk size={14} className="text-slate-400"/> {jar.volumeMl}mL
                      <span className="text-slate-300">|</span>
                      {jar.milkType}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {jar.extractionDate} <span className="text-xs opacity-75">{jar.extractionTime}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(jar.status)}`}>
                      {jar.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-pink-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredJars.length === 0 && (
             <div className="p-12 text-center text-slate-400">
               No se encontraron frascos.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jars;