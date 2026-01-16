import React from 'react';
import { X, FileText, CheckCircle, AlertTriangle, Shield, Calendar, Building } from 'lucide-react';

interface ConsentimientoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  donorName: string;
  donorFolio: string;
  consentDate?: string;
  hospitalName?: string;
}

export const ConsentimientoViewerModal: React.FC<ConsentimientoViewerModalProps> = ({
  isOpen,
  onClose,
  donorName,
  donorFolio,
  consentDate,
  hospitalName = 'Hospital Materno Perinatal "Mónica Pretelini Sáenz"'
}) => {
  if (!isOpen) return null;

  // Calcular estado de vigencia (6 meses)
  const fechaFirma = consentDate ? new Date(consentDate) : new Date();
  const fechaVencimiento = new Date(fechaFirma);
  fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 6);
  
  const hoy = new Date();
  const esVigente = hoy <= fechaVencimiento;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] animate-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Consentimiento Informado</h3>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-500 font-mono">Folio: {donorFolio}</p>
                <span className="text-xs text-slate-300">|</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  esVigente 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {esVigente ? 'VIGENTE' : 'VENCIDO'}
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-8 bg-white relative">
          
          {/* Watermark for Expired Status */}
          {!esVigente && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10 z-0">
              <div className="border-8 border-red-600 text-red-600 text-9xl font-black uppercase p-10 -rotate-45 rounded-xl">
                VENCIDO
              </div>
            </div>
          )}

          <div className="relative z-10 max-w-2xl mx-auto text-sm text-slate-800 leading-relaxed space-y-6 text-justify">
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
               <div>
                 <span className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Building size={12}/> Unidad Médica</span>
                 <p className="font-semibold">{hospitalName}</p>
               </div>
               <div>
                 <span className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><Calendar size={12}/> Fecha de Firma</span>
                 <p className="font-semibold">{formatDate(fechaFirma)}</p>
               </div>
            </div>

            <p>
              Con fundamento en la Ley General de Salud, y en la Ley para la Protección, Apoyo y Promoción a la Lactancia Materna del Estado de México.
            </p>

            <p>
              La que suscribe Sra. <strong>{donorName}</strong>, en forma voluntaria y sin ninguna presión o inducción consiento donar una o varias muestras de leche materna y consiento en que la muestra que estoy donando sea usada con el propósito de alimentar a otros niños que así lo requieran, o investigación científica: <strong>Sí</strong>.
            </p>

            <p>
              Entiendo el método para la extracción de leche materna, conservación, transporte y en caso de no acudir directamente al banco de leche humana o lactario hospitalario, me la extraeré de forma manual siguiendo estrictamente las instrucciones que me sean dadas antes de cada donación y la proporcionaré el día y la hora acordada.
            </p>

            <p>
              Una vez que esté participando como donante, reportaré todo cambio en mi estado de salud, especialmente en lo referente a enfermedades de transmisión sexual, hepatitis u otras; así mismo acepto realizarme los exámenes de laboratorio que sean requeridos.
            </p>

            <p>
              Entiendo que puedo terminar mi participación como donante en cualquier momento.
            </p>

            <p>
              Me comprometo a acudir a la consulta de control nutricional para mi bebé(s) y para mí.
            </p>

            <p>
              Consiento ser contactada periódicamente aun después de haber donado leche.
            </p>

            <div className="bg-blue-50 p-4 border-l-4 border-blue-500 text-blue-900 italic my-6">
              No recibiré remuneración económica alguna por la donación. Se guardará estricta confidencialidad sobre los datos obtenidos.
            </div>

            <p className="font-bold text-center mt-8">
              Declaro que la información contenida en este documento me ha sido explicada de forma clara y precisa.
            </p>

            {/* Firmas Visuales (Representación) */}
            <div className="grid grid-cols-2 gap-12 mt-16 pt-8">
               <div className="text-center">
                 <div className="border-t border-slate-800 pt-2">
                   <p className="font-bold">{donorName}</p>
                   <p className="text-xs text-slate-500 uppercase">Donadora</p>
                   <div className="mt-2 text-[10px] text-green-600 bg-green-50 inline-block px-2 py-1 rounded border border-green-200">
                     <CheckCircle size={10} className="inline mr-1"/> Firmado Digitalmente
                   </div>
                 </div>
               </div>
               <div className="text-center">
                 <div className="border-t border-slate-800 pt-2">
                   <p className="font-bold">Personal de Salud</p>
                   <p className="text-xs text-slate-500 uppercase">Responsable del Registro</p>
                   <div className="mt-2 text-[10px] text-green-600 bg-green-50 inline-block px-2 py-1 rounded border border-green-200">
                     <CheckCircle size={10} className="inline mr-1"/> Validado
                   </div>
                 </div>
               </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center rounded-b-xl">
          <div className="flex items-center gap-2 text-xs text-slate-500">
             <Shield size={14}/> Documento legal protegido contra edición.
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 text-white font-medium hover:bg-slate-700 rounded-lg shadow-sm transition-colors"
          >
            Cerrar Visualización
          </button>
        </div>
      </div>
    </div>
  );
};