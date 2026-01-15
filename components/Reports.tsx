import React, { useState } from 'react';
import { 
  Layout, FileText, Clipboard, BarChart3, Clock, 
  Star, Search, Filter, Plus 
} from 'lucide-react';
import { ReportTemplate, GeneratedReport, ReportConfig } from '../types';
import DashboardExecutive from './DashboardExecutive';
import ReportConfigurator from './ReportConfigurator';
import ReportViewer from './ReportViewer';

// Mock Templates
const REPORT_TEMPLATES: ReportTemplate[] = [
  { 
    id: 'muestras_inadecuadas', title: 'Frecuencia Mensual de Muestras Inadecuadas', 
    category: 'ISEM', description: 'Formato obligatorio de rechazos y causas.', 
    requiredParams: ['dateRange', 'hospital'] 
  },
  { 
    id: 'actividad_diaria', title: 'Actividad Diaria BLH', 
    category: 'OPERATIVE', description: 'Resumen de recolección, procesamiento y distribución.', 
    requiredParams: ['dateRange', 'hospital', 'unit'] 
  },
  { 
    id: 'leche_no_administrada', title: 'Leche Dosificada y No Administrada', 
    category: 'OPERATIVE', description: 'Control de mermas, sobras y trazabilidad de leche preparada no consumida.', 
    requiredParams: ['dateRange', 'hospital', 'unit'] 
  },
  { 
    id: 'seguimiento_receptores', title: 'Seguimiento de Receptores', 
    category: 'CLINICAL', description: 'Evolución de peso y consumo por neonato.', 
    requiredParams: ['dateRange', 'hospital'] 
  },
  { 
    id: 'calidad_pasteurizacion', title: 'Calidad de Pasteurización', 
    category: 'QUALITY', description: 'Curvas de temperatura y resultados de cultivo.', 
    requiredParams: ['dateRange'] 
  },
];

type ViewState = 'CATALOG' | 'DASHBOARD' | 'VIEWER';

const Reports: React.FC = () => {
  const [view, setView] = useState<ViewState>('CATALOG');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Handlers
  const handleSelectTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setShowConfig(true);
  };

  const handleGenerateReport = (config: ReportConfig) => {
    if (!selectedTemplate) return;
    
    // Simulate generation
    const newReport: GeneratedReport = {
      id: `REP-${Date.now()}`,
      templateId: selectedTemplate.id,
      generatedAt: new Date().toISOString(),
      config: config,
      data: {} // Mock data
    };

    setGeneratedReport(newReport);
    setShowConfig(false);
    setView('VIEWER');
  };

  const filteredTemplates = REPORT_TEMPLATES.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render logic
  if (view === 'VIEWER' && generatedReport) {
    return <ReportViewer report={generatedReport} onBack={() => setView('CATALOG')} />;
  }

  return (
    <div className="space-y-6">
      
      {/* Header Tabs */}
      <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm inline-flex mb-2">
        <button 
          onClick={() => setView('CATALOG')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
            view === 'CATALOG' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Clipboard size={16}/> Catálogo de Reportes
        </button>
        <button 
          onClick={() => setView('DASHBOARD')}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
            view === 'DASHBOARD' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BarChart3 size={16}/> Dashboard Ejecutivo
        </button>
      </div>

      {view === 'DASHBOARD' && <DashboardExecutive />}

      {view === 'CATALOG' && (
        <div className="space-y-6">
           {/* Favorites / Frequent */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-5 text-white shadow-md cursor-pointer hover:shadow-lg transition-all" onClick={() => handleSelectTemplate(REPORT_TEMPLATES[0])}>
                 <div className="flex justify-between items-start mb-4">
                   <div className="p-2 bg-white/20 rounded-lg"><FileText size={20}/></div>
                   <Star size={16} className="text-white/70" fill="currentColor"/>
                 </div>
                 <h3 className="font-bold text-lg leading-tight mb-1">Muestras Inadecuadas</h3>
                 <p className="text-pink-100 text-xs">Formato ISEM Mensual</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm cursor-pointer hover:border-pink-300 transition-all" onClick={() => handleSelectTemplate(REPORT_TEMPLATES[2])}>
                 <div className="flex justify-between items-start mb-4">
                   <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Layout size={20}/></div>
                 </div>
                 <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">Mermas y Desechos</h3>
                 <p className="text-slate-500 text-xs">Leche Dosificada No Administrada</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm cursor-pointer hover:border-pink-300 transition-all">
                 <div className="flex justify-between items-start mb-4">
                   <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Clock size={20}/></div>
                 </div>
                 <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">Programados</h3>
                 <p className="text-slate-500 text-xs">3 reportes automáticos</p>
              </div>
           </div>

           {/* Catalog Grid */}
           <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 bg-slate-50">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Buscar reporte..." 
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                  <Filter size={18} /> Categoría
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredTemplates.map(template => (
                  <div key={template.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                     <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg flex-shrink-0 ${
                          template.category === 'ISEM' ? 'bg-amber-100 text-amber-700' :
                          template.category === 'OPERATIVE' ? 'bg-blue-100 text-blue-700' :
                          template.category === 'CLINICAL' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 group-hover:text-pink-600 transition-colors">{template.title}</h4>
                          <p className="text-sm text-slate-500 mb-1">{template.description}</p>
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            {template.category}
                          </span>
                        </div>
                     </div>
                     <button 
                       onClick={() => handleSelectTemplate(template)}
                       className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-800 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                     >
                       Configurar
                     </button>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}

      {/* Config Modal */}
      {showConfig && selectedTemplate && (
        <ReportConfigurator 
          template={selectedTemplate}
          onClose={() => setShowConfig(false)}
          onGenerate={handleGenerateReport}
        />
      )}

    </div>
  );
};

export default Reports;