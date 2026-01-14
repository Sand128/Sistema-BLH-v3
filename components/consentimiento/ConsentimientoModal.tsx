import React, { useState, useRef } from 'react';
import { 
  X, FileSignature, Upload, AlertCircle, 
  Check, User, ChevronRight, FileText
} from 'lucide-react';
import { ConsentimientoFormData } from '../../types/extended-types';
import { consentimientoService } from '../../services/consentimientoService';

interface ConsentimientoModalProps {
  isOpen: boolean;
  onClose: () => void;
  donorId: string;
  donorName: string;
  onSuccess?: () => void;
}

export const ConsentimientoModal: React.FC<ConsentimientoModalProps> = ({
  isOpen,
  onClose,
  donorId,
  donorName,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Información, 2: Términos, 3: Firma
  const [formData, setFormData] = useState<ConsentimientoFormData>({
    donadoraId: donorId,
    donadoraNombre: donorName,
    fechaFirma: new Date().toISOString().split('T')[0],
    testigoNombre: '',
    testigoCargo: 'Personal de Salud',
    unidadMedica: 'Hospital Materno Perinatal Mónica Pretelini',
    firmaDigital: null,
    aceptaTerminos: false,
    informacionCompleta: false,
    voluntario: false,
    puedeRevocar: false
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof ConsentimientoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, firmaDigital: 'Debe ser una imagen (JPG, PNG)' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, firmaDigital: 'La imagen debe ser menor a 5MB' }));
        return;
      }
      handleInputChange('firmaDigital', file);
    }
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (stepNumber === 1) {
      if (!formData.testigoNombre.trim()) newErrors.testigoNombre = 'Nombre del testigo es requerido';
      if (!formData.testigoCargo.trim()) newErrors.testigoCargo = 'Cargo del testigo es requerido';
    }
    
    if (stepNumber === 2) {
      if (!formData.aceptaTerminos) newErrors.aceptaTerminos = 'Debe aceptar los términos';
      if (!formData.informacionCompleta) newErrors.informacionCompleta = 'Debe confirmar información completa';
      if (!formData.voluntario) newErrors.voluntario = 'Debe confirmar voluntariedad';
      if (!formData.puedeRevocar) newErrors.puedeRevocar = 'Debe reconocer derecho a revocar';
    }
    
    if (stepNumber === 3) {
      if (!formData.firmaDigital) newErrors.firmaDigital = 'Debe cargar una firma digital';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step < 3) setStep(step + 1);
      else handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setLoading(true);
    try {
      await consentimientoService.registrarConsentimiento(formData);
      if (onSuccess) onSuccess();
      setStep(1);
      onClose();
    } catch (error: any) {
      console.error(error);
      alert('Error al registrar consentimiento');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Donadora: {donorName}</p>
                <p className="text-xs text-blue-700">ID: {donorId}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Testigo *</label>
                <input
                  type="text"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none ${errors.testigoNombre ? 'border-red-500' : 'border-slate-300'}`}
                  value={formData.testigoNombre}
                  onChange={(e) => handleInputChange('testigoNombre', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cargo *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={formData.testigoCargo}
                  onChange={(e) => handleInputChange('testigoCargo', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  value={formData.fechaFirma}
                  onChange={(e) => handleInputChange('fechaFirma', e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-bold text-amber-900 text-sm mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Declaraciones
              </h4>
              <p className="text-xs text-amber-800">Lea cuidadosamente y marque su aceptación.</p>
            </div>
            <div className="space-y-3">
              {[
                { key: 'aceptaTerminos', text: 'Acepto los términos del consentimiento para donación.' },
                { key: 'informacionCompleta', text: 'He recibido información completa y resuelto dudas.' },
                { key: 'voluntario', text: 'Declaro que mi donación es voluntaria y sin remuneración.' },
                { key: 'puedeRevocar', text: 'Reconozco que puedo revocar mi consentimiento.' }
              ].map((item: any) => (
                <label key={item.key} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={(formData as any)[item.key]}
                    onChange={(e) => handleInputChange(item.key, e.target.checked)}
                    className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 font-medium">{item.text}</span>
                </label>
              ))}
            </div>
            {Object.keys(errors).length > 0 && <p className="text-xs text-red-600 font-bold">Debe aceptar todas las condiciones.</p>}
          </div>
        );
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
                <FileSignature className="h-4 w-4" /> Firma Digital
              </h4>
              <p className="text-xs text-blue-800">Suba una imagen de su firma manuscrita.</p>
            </div>
            
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                errors.firmaDigital ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {formData.firmaDigital ? (
                <div className="space-y-3">
                  <div className="mx-auto h-24 flex items-center justify-center">
                    <img src={URL.createObjectURL(formData.firmaDigital)} alt="Firma" className="max-h-full" />
                  </div>
                  <p className="text-xs text-green-700 font-bold">Firma cargada correctamente</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-slate-400 mx-auto" />
                  <p className="text-sm text-slate-600">Clic para subir imagen</p>
                </div>
              )}
            </div>
            {errors.firmaDigital && <p className="text-xs text-red-600">{errors.firmaDigital}</p>}
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><FileText className="h-5 w-5" /></div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Consentimiento Informado</h3>
                <p className="text-xs text-slate-500">Paso {step} de 3</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
          </div>
          
          <div className="h-1 bg-slate-100 w-full">
            <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
          
          <div className="p-6">{renderStep()}</div>
          
          <div className="flex justify-between p-6 border-t border-slate-200 bg-slate-50">
            {step > 1 ? (
              <button onClick={handleBack} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Anterior</button>
            ) : <div />}
            
            <button 
              onClick={handleNext} 
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2 disabled:opacity-70"
            >
              {loading ? 'Procesando...' : step < 3 ? <>Siguiente <ChevronRight size={16}/></> : <>Registrar <Check size={16}/></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};