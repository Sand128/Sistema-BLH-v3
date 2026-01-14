import React, { useState } from 'react';
import { ArrowLeft, Edit, FileText, Activity, Milk, AlertTriangle, Printer, Calendar } from 'lucide-react';
import { Donor, DonorStatus } from '../types';

interface DonorDetailProps {
  donor: Donor;
  onBack: () => void;
  onEdit: () => void;
}

const DonorDetail: React.FC<DonorDetailProps> = ({ donor, onBack, onEdit }) => {
  const [activeTab, setActiveTab] = useState('info');

  const getStatusColor = (status: DonorStatus) => {
    switch (status) {
      case DonorStatus.ACTIVE: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case DonorStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case DonorStatus.REJECTED: return 'bg-red-100 text-red-700 border-red-200';
      case DonorStatus.SUSPENDED: return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-slate-800">{donor.fullName}</h2>
              <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(donor.status)}`}>
                {donor.status}
              </span>
            </div>
            <p className="text-slate-500 text-sm flex items-center gap-2 mt-1">
              <span className="font-mono bg-slate-100 px-1 rounded">DG-{donor.id.padStart(3, '0')}</span> • {donor.type}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2">
            <Printer size={18} />
            <span className="hidden sm:inline">Exportar PDF</span>
          </button>
          <button onClick={onEdit} className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2">
            <Edit size={18} />
            <span className="hidden sm:inline">Editar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Main Info Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">Datos Generales</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">CURP</span>
                  <span className="font-medium text-slate-800">{donor.curp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Edad</span>
                  <span className="font-medium text-slate-800">{donor.age} años</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Teléfono</span>
                  <span className="font-medium text-slate-800">{donor.contactPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ocupación</span>
                  <span className="font-medium text-slate-800">{donor.occupation || '-'}</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50">
               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Consentimiento</h4>
               <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${donor.consentSigned ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                 <span className="text-sm font-medium">{donor.consentSigned ? 'Firmado' : 'Pendiente'}</span>
                 {donor.consentDate && <span className="text-xs text-slate-400">({donor.consentDate})</span>}
               </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
             <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
               <Activity size={18} className="text-pink-500"/> Indicadores Biológicos
             </h3>
             <div className="grid grid-cols-2 gap-4">
               <div className="p-3 bg-slate-50 rounded-lg">
                 <span className="block text-xs text-slate-500">IMC</span>
                 <span className="text-lg font-bold text-slate-800">{donor.bmi}</span>
               </div>
               <div className="p-3 bg-slate-50 rounded-lg">
                 <span className="block text-xs text-slate-500">Semanas Gest.</span>
                 <span className="text-lg font-bold text-slate-800">{donor.gestationalAge}</span>
               </div>
             </div>
          </div>
        </div>

        {/* Right Col: Tabs & Content */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[500px]">
          <div className="flex border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('info')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'info' ? 'border-pink-500 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <FileText size={16}/> Clínico
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'history' ? 'border-pink-500 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              <Milk size={16}/> Historial Donaciones
            </button>
          </div>

          <div className="p-6 flex-1">
            {activeTab === 'info' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">Resultados de Laboratorio</h4>
                  <div className="overflow-hidden border border-slate-200 rounded-lg">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-600">
                        <tr>
                          <th className="px-4 py-2">Prueba</th>
                          <th className="px-4 py-2">Resultado</th>
                          <th className="px-4 py-2">Fecha</th>
                          <th className="px-4 py-2">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {donor.labResults?.map((lab, i) => (
                          <tr key={i}>
                            <td className="px-4 py-3 font-medium">{lab.testName}</td>
                            <td className="px-4 py-3">{lab.result}</td>
                            <td className="px-4 py-3 text-slate-500">{lab.date}</td>
                            <td className="px-4 py-3">
                              {lab.result === 'No Reactivo' ? (
                                <span className="text-emerald-600 text-xs font-bold px-2 py-0.5 bg-emerald-50 rounded-full">Vigente</span>
                              ) : (
                                <span className="text-red-600 text-xs font-bold px-2 py-0.5 bg-red-50 rounded-full">Alerta</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                   <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wide">Dirección y Contacto</h4>
                   <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
                     {donor.address || 'Sin dirección registrada'}
                   </p>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="text-center py-12">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Milk size={24} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Sin historial reciente</h3>
                <p className="text-slate-500 max-w-xs mx-auto mt-2">Esta donadora aún no tiene extracciones o lotes registrados en el sistema.</p>
                <button className="mt-6 text-pink-600 font-medium hover:underline text-sm">
                  + Registrar Primera Extracción
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDetail;