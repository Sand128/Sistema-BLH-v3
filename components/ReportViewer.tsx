import React from 'react';
import { ArrowLeft, Printer, Download, Mail, Share2, FileCheck } from 'lucide-react';
import { GeneratedReport } from '../types';

interface ReportViewerProps {
  report: GeneratedReport;
  onBack: () => void;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ report, onBack }) => {
  // Report Type Flags
  const isSamplesReport = report.templateId === 'muestras_inadecuadas';
  const isDosageWasteReport = report.templateId === 'leche_no_administrada';

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
        <div className="bg-white shadow-lg w-full max-w-[29.7cm] min-h-[21cm] p-[1.5cm] text-slate-900 relative">
          
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
          <div className="text-center mb-6">
             <h2 className="text-lg font-bold uppercase decoration-slate-400 underline decoration-2 underline-offset-4 mb-2">
               {isDosageWasteReport ? 'CONTROL DE LECHE DOSIFICADA Y NO ADMINISTRADA' : 
                isSamplesReport ? 'Frecuencia Mensual de Muestras Inadecuadas' : 
                'Reporte Operativo'}
             </h2>
             <div className="flex justify-center gap-8 text-sm mt-2">
                <p><span className="font-bold">Unidad Médica:</span> Hospital General "Dr. Nicolás San Juan"</p>
                <p><span className="font-bold">Periodo:</span> {report.config.startDate} al {report.config.endDate}</p>
                <p><span className="font-bold">Servicio:</span> UCIN / Neonatología</p>
             </div>
          </div>

          {/* --- REPORT CONTENT SWITCH --- */}
          
          {isDosageWasteReport && (
            <div className="space-y-4">
               <table className="w-full text-[10px] border-collapse border border-slate-300">
                 <thead className="bg-slate-100 text-slate-700">
                   <tr>
                     <th className="border border-slate-300 p-2" rowSpan={2}>Fecha / Hora</th>
                     <th className="border border-slate-300 p-2" rowSpan={2}>Receptor (Expediente/Nombre)</th>
                     <th className="border border-slate-300 p-2" colSpan={3}>Trazabilidad del Producto</th>
                     <th className="border border-slate-300 p-2" colSpan={3}>Volumen (mL)</th>
                     <th className="border border-slate-300 p-2" rowSpan={2}>Causa del Desecho</th>
                     <th className="border border-slate-300 p-2" rowSpan={2}>Autorización (Médico/Servicio)</th>
                     <th className="border border-slate-300 p-2" rowSpan={2}>Rúbrica Responsable</th>
                   </tr>
                   <tr>
                     <th className="border border-slate-300 p-1 bg-slate-50">Tipo</th>
                     <th className="border border-slate-300 p-1 bg-slate-50">Lote</th>
                     <th className="border border-slate-300 p-1 bg-slate-50">Frasco / Vol. Desc.</th>
                     <th className="border border-slate-300 p-1 bg-blue-50">Dosificado</th>
                     <th className="border border-slate-300 p-1 bg-emerald-50">Admin.</th>
                     <th className="border border-slate-300 p-1 bg-red-50 text-red-700">Desechado</th>
                   </tr>
                 </thead>
                 <tbody>
                   {/* Row 1: Homologous Example */}
                   <tr>
                     <td className="border border-slate-300 p-2 text-center">
                       2024-05-28<br/>09:30
                     </td>
                     <td className="border border-slate-300 p-2 font-bold">
                       RN-01<br/><span className="font-normal text-[9px]">López García</span>
                     </td>
                     <td className="border border-slate-300 p-2 text-center">Homóloga</td>
                     <td className="border border-slate-300 p-2 text-center font-mono">LP-24-001</td>
                     <td className="border border-slate-300 p-2 text-center">F-102</td>
                     <td className="border border-slate-300 p-2 text-center font-bold">15</td>
                     <td className="border border-slate-300 p-2 text-center text-slate-400">10</td>
                     <td className="border border-slate-300 p-2 text-center font-bold text-red-600 bg-red-50">5</td>
                     <td className="border border-slate-300 p-2 text-center">Regurgitación parcial</td>
                     <td className="border border-slate-300 p-2 text-center">Dr. Ruiz (UCIN)</td>
                     <td className="border border-slate-300 p-2 text-center italic">Enf. María S.</td>
                   </tr>
                   {/* Row 2: Heterologous Example */}
                   <tr>
                     <td className="border border-slate-300 p-2 text-center">
                       2024-05-28<br/>11:00
                     </td>
                     <td className="border border-slate-300 p-2 font-bold">
                       RN-05<br/><span className="font-normal text-[9px]">Pérez Martínez</span>
                     </td>
                     <td className="border border-slate-300 p-2 text-center">Heteróloga</td>
                     <td className="border border-slate-300 p-2 text-center font-mono">LP-24-055</td>
                     <td className="border border-slate-300 p-2 text-center text-[9px]">
                       Desc: 200mL
                     </td>
                     <td className="border border-slate-300 p-2 text-center font-bold">20</td>
                     <td className="border border-slate-300 p-2 text-center text-slate-400">0</td>
                     <td className="border border-slate-300 p-2 text-center font-bold text-red-600 bg-red-50">20</td>
                     <td className="border border-slate-300 p-2 text-center">Ayuno por indicación médica</td>
                     <td className="border border-slate-300 p-2 text-center">Dra. Gómez (Qx)</td>
                     <td className="border border-slate-300 p-2 text-center italic">Enf. Juana R.</td>
                   </tr>
                   {/* Row 3: Accidental Spill */}
                   <tr>
                     <td className="border border-slate-300 p-2 text-center">
                       2024-05-28<br/>14:15
                     </td>
                     <td className="border border-slate-300 p-2 font-bold">
                       RN-02<br/><span className="font-normal text-[9px]">Sánchez J.</span>
                     </td>
                     <td className="border border-slate-300 p-2 text-center">Homóloga</td>
                     <td className="border border-slate-300 p-2 text-center font-mono">LP-24-001</td>
                     <td className="border border-slate-300 p-2 text-center">F-105</td>
                     <td className="border border-slate-300 p-2 text-center font-bold">12</td>
                     <td className="border border-slate-300 p-2 text-center text-slate-400">0</td>
                     <td className="border border-slate-300 p-2 text-center font-bold text-red-600 bg-red-50">12</td>
                     <td className="border border-slate-300 p-2 text-center">Derrame accidental</td>
                     <td className="border border-slate-300 p-2 text-center">Dr. Ruiz (UCIN)</td>
                     <td className="border border-slate-300 p-2 text-center italic">Enf. Luisa M.</td>
                   </tr>
                 </tbody>
                 <tfoot className="bg-slate-50 font-bold">
                    <tr>
                      <td colSpan={5} className="border border-slate-300 p-2 text-right">TOTALES</td>
                      <td className="border border-slate-300 p-2 text-center">47 mL</td>
                      <td className="border border-slate-300 p-2 text-center">10 mL</td>
                      <td className="border border-slate-300 p-2 text-center text-red-700">37 mL</td>
                      <td colSpan={3} className="border border-slate-300 p-2"></td>
                    </tr>
                 </tfoot>
               </table>

               <div className="border border-slate-300 p-3 rounded-sm mt-4">
                 <h4 className="font-bold text-xs uppercase mb-1">Observaciones e Incidencias</h4>
                 <p className="text-xs text-slate-600 italic">
                   Se reporta descongelación de 200mL de leche heteróloga Lote LP-24-055 a las 10:00 hrs. El volumen restante (180mL) permanece en refrigeración bajo control de temperatura para siguientes tomas del turno.
                 </p>
               </div>
            </div>
          )}

          {isSamplesReport && (
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
          )}

          {!isSamplesReport && !isDosageWasteReport && (
            <div className="text-center py-20 text-slate-400">
              <p>Vista previa genérica para este tipo de reporte.</p>
            </div>
          )}

          {/* Footer Signatures */}
          <div className="absolute bottom-[1.5cm] left-[1.5cm] right-[1.5cm] flex justify-between gap-8">
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