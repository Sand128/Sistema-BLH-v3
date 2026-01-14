import React, { useState } from 'react';
import { Plus, Search, Filter, Baby, Activity, Utensils, AlertCircle, History } from 'lucide-react';
import { Receiver, AdministrationRecord } from '../types';
import ReceiverForm from './ReceiverForm';
import AdministrationWizard from './AdministrationWizard';

// Mock Receivers
const MOCK_RECEIVERS: Receiver[] = [
  {
    id: '1', expediente: 'RN-01', fullName: 'B. López García', birthDate: '2024-05-20',
    gestationalAge: 32, weightKg: 1.25, diagnosis: 'SDR / Prematurez', location: 'UCIN Cama 3',
    status: 'Estable', allergies: [],
    prescription: {
      volumeTotalPerDay: 120, frequency: 8, volumePerTake: 15,
      milkTypePreference: 'Heteróloga', caloricRequirement: 'Normocalórica' as any,
      prescribedBy: 'Dr. Ruiz', lastUpdate: '2024-05-27'
    }
  },
  {
    id: '2', expediente: 'RN-02', fullName: 'A. Pérez Martínez', birthDate: '2024-05-18',
    gestationalAge: 28, weightKg: 0.98, diagnosis: 'Sepsis Neonatal', location: 'UCIN Cama 5',
    status: 'Crítico', allergies: [],
    prescription: {
      volumeTotalPerDay: 80, frequency: 8, volumePerTake: 10,
      milkTypePreference: 'Heteróloga', caloricRequirement: 'Normocalórica' as any,
      prescribedBy: 'Dr. Ruiz', lastUpdate: '2024-05-26'
    }
  }
];

type ViewState = 'LIST' | 'CREATE' | 'ADMINISTER';

const Receivers: React.FC = () => {
  const [view, setView] = useState<ViewState>('LIST');
  const [receivers, setReceivers] = useState<Receiver[]>(MOCK_RECEIVERS);
  const [selectedReceiver, setSelectedReceiver] = useState<Receiver | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateReceiver = (newReceiver: Receiver) => {
    setReceivers([newReceiver, ...receivers]);
    setView('LIST');
  };

  const handleStartAdministration = (receiver: Receiver) => {
    setSelectedReceiver(receiver);
    setView('ADMINISTER');
  };

  const handleAdministrationComplete = (record: AdministrationRecord) => {
    alert(`Administración registrada con folio ${record.id}`);
    setView('LIST');
    setSelectedReceiver(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Estable': return 'bg-emerald-100 text-emerald-700';
      case 'Observación': return 'bg-amber-100 text-amber-700';
      case 'Crítico': return 'bg-red-100 text-red-700 animate-pulse';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const filteredReceivers = receivers.filter(r => 
    r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.expediente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // RENDER LOGIC
  if (view === 'CREATE') {
    return <ReceiverForm onSubmit={handleCreateReceiver} onCancel={() => setView('LIST')} />;
  }

  if (view === 'ADMINISTER' && selectedReceiver) {
    return (
      <AdministrationWizard 
        receiver={selectedReceiver} 
        onComplete={handleAdministrationComplete} 
        onCancel={() => setView('LIST')} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Receptores y Dosificación</h2>
          <p className="text-slate-500">Gestión clínica de pacientes y administración de leche</p>
        </div>
        <button 
          onClick={() => setView('CREATE')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={20} /> Nuevo Receptor
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-xs text-slate-500 uppercase font-bold">Activos en UCIN</p>
               <p className="text-2xl font-bold text-slate-800">{receivers.length}</p>
            </div>
            <Baby className="text-blue-200" size={32} />
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-xs text-slate-500 uppercase font-bold">Tomas Pendientes</p>
               <p className="text-2xl font-bold text-orange-500">12</p>
            </div>
            <Utensils className="text-orange-200" size={32} />
         </div>
      </div>

      {/* LIST */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o expediente..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <Filter size={18} /> Filtros
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium text-sm">
              <tr>
                <th className="px-6 py-4">Expediente</th>
                <th className="px-6 py-4">Paciente</th>
                <th className="px-6 py-4">Clínica</th>
                <th className="px-6 py-4">Prescripción (Día)</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredReceivers.map(receiver => (
                <tr key={receiver.id} className="hover:bg-slate-50 group">
                  <td className="px-6 py-4 font-mono font-medium text-slate-700">{receiver.expediente}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{receiver.fullName}</p>
                    <p className="text-xs text-slate-500">{receiver.location}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-700">{receiver.weightKg} kg • {receiver.gestationalAge} sem</p>
                    <p className="text-xs text-slate-400 truncate max-w-[150px]" title={receiver.diagnosis}>{receiver.diagnosis}</p>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                       <span className="font-bold text-slate-700">{receiver.prescription?.volumeTotalPerDay} mL</span>
                       <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">
                         {receiver.prescription?.frequency} tomas
                       </span>
                     </div>
                     <p className="text-xs text-slate-400 mt-1">{receiver.prescription?.milkTypePreference}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(receiver.status)}`}>
                      {receiver.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg" title="Historial">
                        <History size={18}/>
                      </button>
                      <button 
                        onClick={() => handleStartAdministration(receiver)}
                        className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-sm"
                      >
                        <Utensils size={14} /> Administrar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReceivers.length === 0 && (
            <div className="p-12 text-center text-slate-400">No se encontraron pacientes activos.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Receivers;