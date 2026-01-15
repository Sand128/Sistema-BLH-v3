import React, { useState } from 'react';
import { Plus, Search, Filter, Baby, Activity, Utensils, AlertCircle, History, ArrowLeft, Droplet, Clock, User, FileText, AlertTriangle } from 'lucide-react';
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

// Mock Administration History
const MOCK_ADMINISTRATION_LOGS: AdministrationRecord[] = [
  {
    id: 'ADM-101', receiverId: '1', receiverName: 'B. López García', batchId: 'B1', batchFolio: 'LP-2024-05-20-001',
    volumePrescribed: 15, volumeAdministered: 15, volumeDiscarded: 0, 
    timestamp: '2024-05-28T08:00:00', responsible: 'Enf. María S.', temperature: 16, via: 'Sonda Nasogástrica'
  },
  {
    id: 'ADM-102', receiverId: '1', receiverName: 'B. López García', batchId: 'B1', batchFolio: 'LP-2024-05-20-001',
    volumePrescribed: 15, volumeAdministered: 10, volumeDiscarded: 5, discardReason: 'Regurgitación parcial',
    timestamp: '2024-05-28T11:00:00', responsible: 'Enf. María S.', temperature: 16.5, via: 'Sonda Nasogástrica'
  },
  {
    id: 'ADM-201', receiverId: '2', receiverName: 'A. Pérez Martínez', batchId: 'B2', batchFolio: 'LP-2024-05-21-002',
    volumePrescribed: 10, volumeAdministered: 10, volumeDiscarded: 0,
    timestamp: '2024-05-28T09:30:00', responsible: 'Enf. Juana R.', temperature: 16, via: 'Sonda Orogástrica'
  }
];

type ViewState = 'LIST' | 'CREATE' | 'ADMINISTER' | 'HISTORY';

const Receivers: React.FC = () => {
  const [view, setView] = useState<ViewState>('LIST');
  const [receivers, setReceivers] = useState<Receiver[]>(MOCK_RECEIVERS);
  const [selectedReceiver, setSelectedReceiver] = useState<Receiver | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Derived state for history
  const historyLogs = selectedReceiver 
    ? MOCK_ADMINISTRATION_LOGS.filter(log => log.receiverId === selectedReceiver.id).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : [];

  const handleCreateReceiver = (newReceiver: Receiver) => {
    setReceivers([newReceiver, ...receivers]);
    setView('LIST');
  };

  const handleStartAdministration = (receiver: Receiver) => {
    setSelectedReceiver(receiver);
    setView('ADMINISTER');
  };

  const handleViewHistory = (receiver: Receiver) => {
    setSelectedReceiver(receiver);
    setView('HISTORY');
  };

  const handleAdministrationComplete = (record: AdministrationRecord) => {
    // In a real app, we would add this record to the history list/backend
    MOCK_ADMINISTRATION_LOGS.push(record); 
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

  // --- RENDER VIEWS ---

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

  if (view === 'HISTORY' && selectedReceiver) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-[calc(100vh-140px)] animate-in fade-in slide-in-from-right-4">
        {/* History Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex items-center gap-4">
          <button onClick={() => setView('LIST')} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
            <ArrowLeft size={20}/>
          </button>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <History size={20} className="text-blue-500"/> Historial de Alimentación
            </h2>
            <div className="flex gap-4 mt-1 text-sm text-slate-600">
              <span className="font-bold">{selectedReceiver.fullName}</span>
              <span className="font-mono bg-white px-2 rounded border border-slate-200 text-xs flex items-center">{selectedReceiver.expediente}</span>
              <span className="text-slate-400">|</span>
              <span>{selectedReceiver.weightKg} kg</span>
            </div>
          </div>
          <button 
            onClick={() => setView('ADMINISTER')}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm"
          >
            <Utensils size={16}/> Nueva Toma
          </button>
        </div>

        {/* History Table */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-600 font-semibold text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Fecha / Hora</th>
                  <th className="px-6 py-3">Detalles Lote</th>
                  <th className="px-6 py-3 text-center">Volumen (mL)</th>
                  <th className="px-6 py-3">Vía Admin</th>
                  <th className="px-6 py-3">Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {historyLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-medium text-slate-800">
                        <Clock size={14} className="text-slate-400"/>
                        {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 ml-6">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block border border-blue-100 mb-1">
                        {log.batchFolio}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Activity size={10}/> Temp: {log.temperature}°C
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex flex-col items-end">
                        <span className="text-lg font-bold text-slate-700">{log.volumeAdministered}</span>
                        <span className="text-[10px] text-slate-400">de {log.volumePrescribed} prescriptos</span>
                      </div>
                      {log.volumeDiscarded > 0 && (
                        <div className="mt-1 text-xs text-red-600 flex items-center justify-center gap-1 bg-red-50 px-2 py-0.5 rounded border border-red-100" title={log.discardReason}>
                          <AlertTriangle size={10}/> -{log.volumeDiscarded} (Merma)
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs border border-slate-200">
                        <FileText size={12}/> {log.via}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <User size={14} className="text-slate-400"/> {log.responsible}
                      </div>
                    </td>
                  </tr>
                ))}
                {historyLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400">
                      <History size={32} className="mx-auto mb-2 opacity-20"/>
                      <p>No hay registros de administración para este paciente.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // --- LIST VIEW ---
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
                      <button 
                        onClick={() => handleViewHistory(receiver)}
                        className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg hover:text-blue-600 transition-colors" 
                        title="Ver Historial"
                      >
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