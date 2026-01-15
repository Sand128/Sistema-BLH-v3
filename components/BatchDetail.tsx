import React from 'react';
import { ArrowLeft, CheckCircle2, FlaskConical, X, Users, Milk, Calendar, FileText, Droplet, User } from 'lucide-react';
import { MilkBatch, MilkStatus } from '../types';

interface BatchDetailProps {
  batch: MilkBatch;
  onBack: () => void;
  onUpdate: (batch: MilkBatch) => void;
}

const BatchDetail: React.FC<BatchDetailProps> = ({ batch, onBack }) => {

  const getStatusBadge = (status: MilkStatus) => {
    switch (status) {
      case MilkStatus.QUARANTINE: return <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border border-amber-200"><FlaskConical size={16}/> En Cuarentena</span>;
      case MilkStatus.RELEASED: return <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border border-emerald-200"><CheckCircle2 size={16}/> Liberado</span>;
      case MilkStatus.DISCARDED: return <span className="bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border border-red-200"><X size={16}/> Rechazado</span>;
      default: return null;
    }
  };

  // --- MOCK DATA EXPANSION FOR UI DEMO ---
  // En una app real, esto vendría de la base de datos o relaciones del objeto batch.
  const expandedDonors = batch.donors.map((d, index) => ({
    ...d,
    type: index % 2 === 0 ? 'Heteróloga' : 'Homóloga',
    contributionVol: Math.floor(batch.volumeTotalMl / batch.donors.length),
    jarsContributed: Math.ceil(batch.jarIds.length / batch.donors.length),
    lastTestDate: '2024-05-20'
  }));

  const expandedJars = batch.jarIds.map((id, index) => ({
    folio: `FR-${batch.folio.split('-')[1]}-${id.padStart(3, '0')}`,
    vol: Math.floor(batch.volumeTotalMl / batch.jarIds.length),
    date: batch.creationDate.split('T')[0],
    donor: batch.donors[index % batch.donors.length].name
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      
      {/* 1. TOP HEADER & ACTIONS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-5">
          <button onClick={onBack} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
               <h2 className="text-2xl font-bold text-slate-800 font-mono tracking-tight">{batch.folio}</h2>
               {getStatusBadge(batch.status)}
            </div>
            <p className="text-slate-500 text-sm flex items-center gap-2">
              <Calendar size={14}/> Creado el {new Date(batch.creationDate).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
           <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
             <FileText size={16}/> Certificado
           </button>
        </div>
      </div>

      {/* 2. KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Volumen */}
        <div className="bg-blue-600 rounded-xl p-5 text-white shadow-md relative overflow-hidden">
           <Droplet className="absolute -bottom-4 -right-4 text-blue-500 opacity-50" size={80} />
           <p className="text-blue-100 text-xs font-bold uppercase mb-1">Volumen Total</p>
           <h3 className="text-3xl font-bold">{batch.volumeTotalMl} <span className="text-lg font-medium opacity-80">mL</span></h3>
        </div>

        {/* Tipo */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center">
           <p className="text-slate-400 text-xs font-bold uppercase mb-1 flex items-center gap-1">
             <Milk size={12}/> Tipo de Leche
           </p>
           <h3 className="text-xl font-bold text-slate-800">{batch.milkType}</h3>
           <p className="text-xs text-slate-500">{batch.type}</p>
        </div>

        {/* Donantes Count */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center">
           <p className="text-slate-400 text-xs font-bold uppercase mb-1 flex items-center gap-1">
             <Users size={12}/> Composición
           </p>
           <h3 className="text-xl font-bold text-slate-800">{batch.donors.length} Donantes</h3>
           <p className="text-xs text-slate-500">{batch.jarIds.length} Frascos mezclados</p>
        </div>

        {/* Expiración */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-center">
           <p className="text-slate-400 text-xs font-bold uppercase mb-1 flex items-center gap-1">
             <Calendar size={12}/> Caducidad (PEPS)
           </p>
           <h3 className="text-xl font-bold text-orange-600">
             {batch.expirationDate ? new Date(batch.expirationDate).toLocaleDateString() : 'N/A'}
           </h3>
           <p className="text-xs text-slate-500">Vida útil estimada</p>
        </div>
      </div>

      {/* 3. DETAILED COMPOSITION SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT: DONORS TABLE */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Users size={18} className="text-pink-600"/> Donadoras Incluidas
            </h3>
            <span className="text-xs font-bold bg-pink-100 text-pink-700 px-2 py-1 rounded-md">{expandedDonors.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Nombre</th>
                  <th className="px-5 py-3">Tipo</th>
                  <th className="px-5 py-3 text-center">Frascos</th>
                  <th className="px-5 py-3 text-right">Aporte</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {expandedDonors.map((donor, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                          {donor.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-700">{donor.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        donor.type === 'Heteróloga' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-purple-50 text-purple-700 border-purple-100'
                      }`}>
                        {donor.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-slate-600">
                      {donor.jarsContributed}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-slate-700">
                      {donor.contributionVol} mL
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: JARS INVENTORY */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Milk size={18} className="text-blue-600"/> Frascos Utilizados
            </h3>
            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-md">{expandedJars.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Folio Frasco</th>
                  <th className="px-5 py-3">Donadora</th>
                  <th className="px-5 py-3">Extracción</th>
                  <th className="px-5 py-3 text-right">Volumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {expandedJars.map((jar, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-slate-600 font-medium">
                      {jar.folio}
                    </td>
                    <td className="px-5 py-3 text-slate-600 truncate max-w-[120px]" title={jar.donor}>
                      {jar.donor}
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs">
                      {jar.date}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-blue-600">
                      {jar.vol} mL
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BatchDetail;