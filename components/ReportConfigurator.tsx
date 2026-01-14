import React, { useState } from 'react';
import { X, Calendar, Building, FileText, Download } from 'lucide-react';
import { ReportTemplate, ReportConfig } from '../types';

interface ReportConfiguratorProps {
  template: ReportTemplate;
  onClose: () => void;
  onGenerate: (config: ReportConfig) => void;
}

const ReportConfigurator: React.FC<ReportConfiguratorProps> = ({ template, onClose, onGenerate }) => {
  const [config, setConfig] = useState<ReportConfig>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    hospitalId: 'all',
    milkType: 'all',
    unit: 'all',
    format: 'PDF'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(config);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <div>
            <h3 className="font-bold text-slate-800">Configurar Reporte</h3>
            <p className="text-xs text-slate-500">{template.title}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Date Range */}
          {template.requiredParams.includes('dateRange') && (
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                <Calendar size={16}/> Rango de Fechas
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Desde</label>
                  <input 
                    type="date" 
                    required
                    value={config.startDate}
                    onChange={(e) => setConfig({...config, startDate: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1 block">Hasta</label>
                  <input 
                    type="date" 
                    required
                    value={config.endDate}
                    onChange={(e) => setConfig({...config, endDate: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hospital Filter */}
          {template.requiredParams.includes('hospital') && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Building size={16}/> Hospital / Unidad
              </label>
              <select 
                value={config.hospitalId}
                onChange={(e) => setConfig({...config, hospitalId: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="all">Todos los Hospitales</option>
                <option value="h1">H.G. Dr. Nicolás San Juan</option>
                <option value="h2">H.M.I. Mónica Pretelini</option>
              </select>
            </div>
          )}

          {/* Unit Filter */}
          {template.requiredParams.includes('unit') && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Building size={16}/> Área Médica
              </label>
              <select 
                value={config.unit}
                onChange={(e) => setConfig({...config, unit: e.target.value})}
                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="all">Todas las áreas</option>
                <option value="ucin">UCIN</option>
                <option value="neonatos">Neonatología</option>
                <option value="lactarios">Lactarios</option>
              </select>
            </div>
          )}

          {/* Format Selection */}
          <div>
             <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <FileText size={16}/> Formato de Salida
             </label>
             <div className="grid grid-cols-3 gap-3">
               {['PDF', 'EXCEL', 'CSV'].map(fmt => (
                 <button
                   key={fmt}
                   type="button"
                   onClick={() => setConfig({...config, format: fmt as any})}
                   className={`py-2 text-sm font-medium rounded-lg border text-center transition-colors
                     ${config.format === fmt 
                       ? 'bg-slate-800 text-white border-slate-800' 
                       : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}
                   `}
                 >
                   {fmt}
                 </button>
               ))}
             </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
             <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium">Cancelar</button>
             <button type="submit" className="px-4 py-2 bg-pink-600 text-white hover:bg-pink-700 rounded-lg font-bold flex items-center gap-2 shadow-sm">
               <Download size={16} /> Generar Reporte
             </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ReportConfigurator;