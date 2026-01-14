import React from 'react';
import { ArrowLeft, Printer, Download, Mail, Share2, FileCheck } from 'lucide-react';
import { GeneratedReport } from '../types';

interface ReportViewerProps {
  report: GeneratedReport;
  onBack: () => void;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ report, onBack }) => {
  // Mock Data for "Inadequate Samples" report
  const isSamplesReport = report.templateId === 'muestras_inadecuadas';

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="font-bold text-slate-800 text-sm md:text-base">{report.id}</h3>
            <p className="text-xs text-slate-500">Generado: {new Date(report.generatedAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg" title="Imprimir">
            <Printer size={18} />
          </button>
          <button className="p-2 text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg" title="Enviar Email">
            <Mail size={18} />
          </button>
          <button className="px-4 py-2 bg-slate-800 text-white rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-slate-700">
            <Download size={16} /> Descargar {report.config.format}
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 bg-slate-100 p-6 overflow-y-auto flex justify-center">
        
        {/* Simulate A4 Page */}
        <div className="bg-white shadow-lg w-full max-w-[21cm] min-h-[29.7cm] p-[2cm] text-slate-900 relative">
          
          {/* Header ISEM */}
          <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-start">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-xs text-slate-500">LOGO</div>
               <div>
                 <h1 className="text-sm font-bold uppercase tracking-widest">Instituto de Salud del Estado de México</h1>
                 <h2 className="text-xs font-bold uppercase text-slate-600">Coordinación Estatal de Lactancia Materna</h2>
               </div>
             </div>
             <div className="text-right">
                <p className="text-xs font-bold text-slate-500">Formato: {report.config.format === 'PDF' ? 'Oficial' : 'Preliminar'}</p>
                <p className="text-xs text-slate-400">Ref: {report.templateId.toUpperCase()}</p>
             </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
             <h2 className="text-lg font-bold uppercase decoration-slate-400 underline decoration-2 underline-offset-4 mb-2">
               {report.templateId === 'muestras_inadecuadas' ? 'Frecuencia Mensual de Muestras Inadecuadas' : 'Reporte Operativo'}
             </h2>
             <p className="text-sm font-medium text-slate-600">
               Periodo: {report.config.startDate} al {report.config.endDate}
             </p>
             <p className="text-sm text-slate-500">Hospital General "Dr. Nicolás San Juan"</p>
          </div>

          {/* Content (Conditional) */}
          {isSamplesReport ? (
            <div className="space-y-6">
               <table className="w-full text-sm border-collapse border border-slate-300">
                 <thead className="bg-slate-100">
                   <tr>
                     <th className="border border-slate-300 p-2 text-left">Causa de Rechazo</th>
                     <th className="border border-slate-300 p-2 text-center">Cantidad</th>
                     <th className="border border-slate-300 p-2 text-center">% del Total</th>
                     <th className="border border-slate-300 p-2 text-center">Tendencia</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr>
                     <td className="border border-slate-300 p-2">Acidez Elevada (&gt;8°D)</td>
                     <td className="border border-slate-300 p-2 text-center">12</td>
                     <td className="border border-slate-300 p-2 text-center">30%</td>
                     <td className="border border-slate-300 p-2 text-center text-red-600">▲ Alta</td>
                   </tr>
                   <tr>
                     <td className="border border-slate-300 p-2">Color Anormal</td>
                     <td className="border border-slate-300 p-2 text-center">8</td>
                     <td className="border border-slate-300 p-2 text-center">20%</td>
                     <td className="border border-slate-300 p-2 text-center text-emerald-600">▼ Baja</td>
                   </tr>
                   <tr>
                     <td className="border border-slate-300 p-2">Contaminación Visible</td>
                     <td className="border border-slate-300 p-2 text-center">6</td>
                     <td className="border border-slate-300 p-2 text-center">15%</td>
                     <td className="border border-slate-300 p-2 text-center text-amber-600">▬ Estable</td>
                   </tr>
                   <tr>
                     <td className="border border-slate-300 p-2 font-bold bg-slate-50">TOTAL</td>
                     <td className="border border-slate-300 p-2 text-center font-bold">40</td>
                     <td className="border border-slate-300 p-2 text-center font-bold">100%</td>
                     <td className="border border-slate-300 p-2"></td>
                   </tr>
                 </tbody>
               </table>

               <div className="border border-slate-300 p-4 rounded-sm">
                 <h4 className="font-bold text-sm mb-2 uppercase border-b border-slate-200 pb-1">Análisis y Observaciones</h4>
                 <p className="text-sm leading-relaxed text-justify">
                   Se observa un incremento del 2% en rechazos por acidez elevada respecto al mes anterior, sugiriendo la necesidad de reforzar la capacitación en técnicas de conservación durante el transporte. Los rechazos por color anormal han disminuido gracias al nuevo filtro visual en recepción.
                 </p>
               </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">
              <p>Vista previa genérica para este tipo de reporte.</p>
            </div>
          )}

          {/* Footer Signatures */}
          <div className="absolute bottom-[2cm] left-[2cm] right-[2cm] flex justify-between gap-8">
             <div className="flex-1 text-center">
               <div className="border-t border-slate-400 pt-2 mb-1"></div>
               <p className="text-xs font-bold uppercase">Responsable de Banco de Leche</p>
               <p className="text-[10px] text-slate-500">Dr. Alejandro Méndez</p>
             </div>
             <div className="flex-1 text-center">
               <div className="border-t border-slate-400 pt-2 mb-1"></div>
               <p className="text-xs font-bold uppercase">Coordinación Médica</p>
               <p className="text-[10px] text-slate-500">Dra. Ana Martínez</p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReportViewer;