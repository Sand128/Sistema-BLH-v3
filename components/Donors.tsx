import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Phone, Calendar, ChevronRight, AlertCircle } from 'lucide-react';
import { Donor, DonorStatus, DonorType } from '../types';
import DonorForm from './DonorForm';
import DonorDetail from './DonorDetail';

// Mock Data
const MOCK_DONORS: Donor[] = [
  { 
    id: '1', fullName: 'María González Pérez', curp: 'GOPM900101...', birthDate: '1990-01-01', status: DonorStatus.ACTIVE, type: DonorType.HOMOLOGOUS_INTERNAL, 
    contactPhone: '55 1234 5678', lastDonationDate: '2023-11-20', registrationDate: '2023-10-15', age: 28, bmi: 22.4, consentSigned: true, 
    labResults: [
        { id:'1', testName:'VIH', result: 'No Reactivo', date: '2023-10-15' },
        { id:'2', testName:'VDRL', result: 'No Reactivo', date: '2023-10-15' }
    ]
  },
  { 
    id: '2', fullName: 'Ana López Martínez', curp: 'LOMA920512...', birthDate: '1992-05-12', status: DonorStatus.PENDING, type: DonorType.HETEROLOGOUS, 
    contactPhone: '722 9876 5432', registrationDate: '2023-11-22', age: 31, consentSigned: false 
  },
  { 
    id: '3', fullName: 'Lucía Hernández Ruiz', curp: 'HERL880920...', birthDate: '1988-09-20', status: DonorStatus.REJECTED, type: DonorType.HOMOLOGOUS_INTERNAL, 
    contactPhone: '55 5678 1234', registrationDate: '2023-09-10', age: 35, consentSigned: true,
    labResults: [
        { id:'1', testName:'VIH', result: 'Reactivo', date: '2023-09-10' }
    ]
  },
];

type ViewState = 'LIST' | 'CREATE' | 'EDIT' | 'DETAIL';

const Donors: React.FC = () => {
  const [view, setView] = useState<ViewState>('LIST');
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [donors, setDonors] = useState<Donor[]>(MOCK_DONORS);

  // VIEW HANDLERS
  const handleCreate = () => {
    setSelectedDonor(null);
    setView('CREATE');
  };

  const handleEdit = (donor: Donor) => {
    setSelectedDonor(donor);
    setView('EDIT');
  };

  const handleDetail = (donor: Donor) => {
    setSelectedDonor(donor);
    setView('DETAIL');
  };

  const handleSubmitForm = (data: Donor) => {
    if (view === 'CREATE') {
      const newDonor = { ...data, id: (donors.length + 1).toString(), registrationDate: new Date().toISOString().split('T')[0] };
      setDonors([newDonor, ...donors]);
    } else {
      setDonors(donors.map(d => d.id === selectedDonor?.id ? { ...d, ...data } : d));
    }
    setView('LIST');
  };

  // HELPERS
  const getStatusColor = (status: DonorStatus) => {
    switch (status) {
      case DonorStatus.ACTIVE: return 'bg-emerald-100 text-emerald-700';
      case DonorStatus.PENDING: return 'bg-amber-100 text-amber-700';
      case DonorStatus.SUSPENDED: return 'bg-rose-100 text-rose-700';
      case DonorStatus.REJECTED: return 'bg-red-100 text-red-700 font-bold';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // FILTERING
  const filteredDonors = donors.filter(d => 
    d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.curp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // RENDER
  if (view === 'CREATE' || (view === 'EDIT' && selectedDonor)) {
    return (
      <DonorForm 
        initialData={selectedDonor || {}} 
        onSubmit={handleSubmitForm} 
        onCancel={() => setView('LIST')} 
        isEditMode={view === 'EDIT'}
      />
    );
  }

  if (view === 'DETAIL' && selectedDonor) {
    return (
      <DonorDetail 
        donor={selectedDonor} 
        onBack={() => setView('LIST')}
        onEdit={() => handleEdit(selectedDonor)}
      />
    );
  }

  // DEFAULT: LIST VIEW
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Directorio de Donadoras</h2>
          <p className="text-slate-500">Gestión de expedientes y estado de elegibilidad</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={20} />
          Registrar Donadora
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o CURP..." 
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium text-sm">
              <tr>
                <th className="px-6 py-4">Donadora</th>
                <th className="px-6 py-4">Clasificación</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Contacto</th>
                <th className="px-6 py-4">Registro</th>
                <th className="px-6 py-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDonors.map((donor) => (
                <tr key={donor.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => handleDetail(donor)}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-pink-600 transition-colors">{donor.fullName}</div>
                      <div className="text-xs text-slate-400 font-mono">{donor.curp}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{donor.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(donor.status)}`}>
                      {donor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-slate-400" />
                      {donor.contactPhone}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {donor.registrationDate}
                  </td>
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                       <button 
                         onClick={() => handleEdit(donor)}
                         className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600"
                         title="Editar"
                       >
                         <MoreVertical size={18} />
                       </button>
                       <button 
                         onClick={() => handleDetail(donor)}
                         className="p-2 hover:bg-pink-50 rounded-lg text-pink-400 hover:text-pink-600 lg:hidden"
                       >
                         <ChevronRight size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredDonors.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} className="text-slate-300"/>
            </div>
            No se encontraron donadoras con esos criterios.
          </div>
        )}
        
        <div className="p-4 border-t border-slate-200 text-sm text-slate-500 flex justify-between items-center">
           <span>Mostrando {filteredDonors.length} registros</span>
           <div className="flex gap-2">
             <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Anterior</button>
             <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>Siguiente</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Donors;