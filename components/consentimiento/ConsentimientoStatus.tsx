import React, { useState, useEffect } from 'react';
import { 
  FileCheck, FileX, AlertTriangle, Calendar, 
  Download, Clock, CheckCircle, XCircle 
} from 'lucide-react';
import { consentimientoService } from '../../services/consentimientoService';
import { DonorType } from '../../types';

interface ConsentimientoStatusProps {
  donorId: string;
  donorName: string;
  isSigned: boolean; // Passed from parent Donor object
  consentDate?: string;
  donorFolio: string;
  donorType: DonorType;
  onDownloadPdf?: () => void;
}

export const ConsentimientoStatus: React.FC<ConsentimientoStatusProps> = ({
  donorId,
  donorName,
  isSigned,
  consentDate,
  donorFolio,
  donorType,
  onDownloadPdf
}) => {
  const [loading, setLoading] = useState(false);

  // Calculate expiration (mock logic based on signed date or current date if missing)
  const fechaFirma = consentDate ? new Date(consentDate) : new Date();
  const fechaVencimiento = new Date(fechaFirma);
  fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 6);
  
  const hoy = new Date();
  const diffTime = fechaVencimiento.getTime() - hoy.getTime();
  const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const estaPorVencer = isSigned && diasRestantes < 30 && diasRestantes > 0;
  const estaVencido = isSigned && diasRestantes <= 0;

  const handleDescargar = async () => {
    if (onDownloadPdf) {
      onDownloadPdf();
      return;
    }

    // Condición: Solo para donadoras HETERÓLOGAS (Heteróloga)
    if (donorType !== DonorType.HETEROLOGOUS) {
      alert('El documento PDF de Consentimiento Informado para Donación Externa solo se genera para donadoras clasificadas como HETERÓLOGAS.');
      return;
    }
    
    setLoading(true);
    try {
      // 1. Generar Blob con el texto oficial
      const pdfBlob = await consentimientoService.generarPdfConsentimiento(
        donorName, 
        fechaFirma.toLocaleDateString('es-MX'), 
        'Hospital Materno Perinatal "Mónica Pretelini Sáenz"' // Mock Unit Name or pass as prop
      );
      
      // 2. Crear URL temporal
      const url = window.URL.createObjectURL(pdfBlob);
      
      // 3. Forzar descarga con nombre específico
      // Convención: Consentimiento_[FOLIO]_[NombreCompletoDonadora].pdf
      const safeName = donorName.replace(/\s+/g, '_');
      const filename = `Consentimiento_${donorFolio}_${safeName}.pdf`;
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // 4. Limpieza
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('Error al generar el documento de consentimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-4 rounded-xl border mb-6 ${
      isSigned 
        ? estaPorVencer 
          ? 'bg-amber-50 border-amber-200' 
          : estaVencido
            ? 'bg-red-50 border-red-200'
            : 'bg-emerald-50 border-emerald-200'
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${
            isSigned 
              ? estaPorVencer 
                ? 'bg-amber-100 text-amber-600' 
                : estaVencido
                  ? 'bg-red-100 text-red-600'
                  : 'bg-emerald-100 text-emerald-600'
              : 'bg-red-100 text-red-600'
          }`}>
            {isSigned ? (
              estaPorVencer ? <AlertTriangle className="h-5 w-5" /> :
              estaVencido ? <FileX className="h-5 w-5" /> :
              <FileCheck className="h-5 w-5" />
            ) : (
              <FileX className="h-5 w-5" />
            )}
          </div>
          
          <div>
            <h4 className="font-bold text-slate-800 text-sm">
              Estatus del Consentimiento Informado
            </h4>
            <div className="mt-1">
              {isSigned ? (
                <div className="space-y-1">
                  <p className="text-sm text-slate-600 flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-emerald-500" />
                    <span className="font-medium">Documento firmado y vigente</span>
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span className={`text-xs font-medium ${
                      estaPorVencer ? 'text-amber-700' :
                      estaVencido ? 'text-red-700' :
                      'text-slate-600'
                    }`}>
                      {estaVencido ? 'VENCIDO ' : 'Vence '}
                      {fechaVencimiento.toLocaleDateString()}
                    </span>
                    
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                      estaPorVencer 
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : estaVencido
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {estaVencido ? 'Requiere Renovación' : `${diasRestantes} días`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm text-red-700 flex items-center gap-2">
                    <XCircle className="h-3 w-3" />
                    <span className="font-bold">No registrado</span>
                  </p>
                  <p className="text-xs text-red-600">
                    Es obligatorio firmar el consentimiento para realizar donaciones.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {isSigned && (
          <button
            onClick={handleDescargar}
            disabled={loading}
            className={`flex items-center gap-1 px-3 py-1.5 bg-white border rounded-lg text-xs font-medium transition-colors ${
              donorType === DonorType.HETEROLOGOUS 
                ? 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                : 'border-slate-100 text-slate-300 cursor-not-allowed'
            }`}
            title={donorType !== DonorType.HETEROLOGOUS ? "Solo disponible para donadoras Heterólogas" : "Descargar PDF"}
          >
            {loading ? <Clock className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
            PDF
          </button>
        )}
      </div>
      
      {estaPorVencer && (
        <div className="mt-3 p-2 bg-white/50 rounded border border-amber-200/50">
          <p className="text-xs text-amber-800 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="font-bold">Acción requerida:</span> Próximo a vencer. Renovar en la siguiente visita.
          </p>
        </div>
      )}
    </div>
  );
};