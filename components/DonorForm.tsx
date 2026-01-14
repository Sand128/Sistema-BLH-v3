import React, { useState, useEffect } from 'react';
import { Save, X, AlertTriangle, FileCheck, Calculator, Calendar } from 'lucide-react';
import { Donor, DonorType, DonorStatus, LabResult } from '../types';

interface DonorFormProps {
  initialData?: Partial<Donor>;
  onSubmit: (data: Donor) => void;
  onCancel: () => void;
  isEditMode?: boolean;
}

const DonorForm: React.FC<DonorFormProps> = ({ initialData, onSubmit, onCancel, isEditMode = false }) => {
  // Initial state setup with default values
  const [formData, setFormData] = useState<Partial<Donor>>({
    status: DonorStatus.PENDING,
    type: DonorType.HOMOLOGOUS_INTERNAL,
    consentSigned: false,
    labResults: [
      { id: '1', testName: 'VIH', result: 'No Reactivo', date: new Date().toISOString().split('T')[0] },
      { id: '2', testName: 'VDRL', result: 'No Reactivo', date: new Date().toISOString().split('T')[0] },
      { id: '3', testName: 'Hepatitis B', result: 'No Reactivo', date: new Date().toISOString().split('T')[0] },
    ],
    ...initialData
  });

  const [activeSection, setActiveSection] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-calculate BMI
  useEffect(() => {
    if (formData.preGestationalWeight && formData.height) {
      const heightM = formData.height / 100;
      const bmi = parseFloat((formData.preGestationalWeight / (heightM * heightM)).toFixed(2));
      setFormData(prev => ({ ...prev, bmi }));
    }
  }, [formData.preGestationalWeight, formData.height]);

  // Auto-calculate Age
  useEffect(() => {
    if (formData.birthDate) {
      const birth = new Date(formData.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      setFormData(prev => ({ ...prev, age }));
    }
  }, [formData.birthDate]);

  const handleChange = (field: keyof Donor, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error if exists
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLabChange = (index: number, field: keyof LabResult, value: any) => {
    const newLabs = [...(formData.labResults || [])];
    newLabs[index] = { ...newLabs[index], [field]: value };
    setFormData(prev => ({ ...prev, labResults: newLabs }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = 'El nombre es obligatorio';
    if (!formData.curp) newErrors.curp = 'El CURP es obligatorio';
    if (!formData.contactPhone) newErrors.contactPhone = 'El teléfono es obligatorio';
    if (!formData.birthDate) newErrors.birthDate = 'Fecha de nacimiento requerida';
    
    // Logic: If active, labs must be non-reactive and consent signed
    if (formData.status === DonorStatus.ACTIVE) {
      if (!formData.consentSigned) newErrors.consentSigned = 'Firma de consentimiento requerida para activar';
      const hasReactive = formData.labResults?.some(l => l.result === 'Reactivo');
      if (hasReactive) newErrors.status = 'No se puede activar con laboratorios Reactivos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData as Donor);
    } else {
      alert("Por favor corrija los errores en el formulario");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {isEditMode ? 'Editar Expediente de Donadora' : 'Registro de Nueva Donadora'}
          </h2>
          <p className="text-xs text-slate-500 font-mono">Formato Oficial 454-24 ISEM</p>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
             <X size={20} />
           </button>
        </div>
      </div>

      {/* Progress / Sections Nav */}
      <div className="flex border-b border-slate-200 bg-white sticky top-0 z-10">
        {[
          { id: 1, label: '1. Identificación' },
          { id: 2, label: '2. Perinatal' },
          { id: 3, label: '3. Clínico' },
          { id: 4, label: '4. Consentimiento' }
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeSection === section.id 
                ? 'border-pink-500 text-pink-600 bg-pink-50/50' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        <form id="donor-form" onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
          
          {/* SECTION 1: IDENTIFICATION */}
          <div className={activeSection === 1 ? 'block space-y-6' : 'hidden'}>
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Datos Personales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo *</label>
                  <input 
                    type="text" 
                    value={formData.fullName || ''}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                    placeholder="Apellidos y Nombres"
                  />
                  {errors.fullName && <span className="text-xs text-red-500 mt-1">{errors.fullName}</span>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">CURP *</label>
                  <input 
                    type="text" 
                    value={formData.curp || ''}
                    onChange={(e) => handleChange('curp', e.target.value.toUpperCase())}
                    className={`w-full p-2 border rounded-lg uppercase ${errors.curp ? 'border-red-500' : 'border-slate-300'}`}
                  />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono *</label>
                   <input 
                    type="tel" 
                    value={formData.contactPhone || ''}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                    className={`w-full p-2 border rounded-lg ${errors.contactPhone ? 'border-red-500' : 'border-slate-300'}`}
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Nacimiento</label>
                    <input 
                      type="date" 
                      value={formData.birthDate || ''}
                      onChange={(e) => handleChange('birthDate', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-sm font-medium text-slate-500 mb-1">Edad</label>
                    <input type="text" disabled value={formData.age || ''} className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-center font-bold" />
                  </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Ocupación</label>
                   <input 
                    type="text" 
                    value={formData.occupation || ''}
                    onChange={(e) => handleChange('occupation', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                   <input 
                    type="text" 
                    value={formData.address || ''}
                    onChange={(e) => handleChange('address', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: PERINATAL */}
          <div className={activeSection === 2 ? 'block space-y-6' : 'hidden'}>
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Antecedentes Perinatales</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Parto</label>
                  <input 
                    type="date" 
                    value={formData.deliveryDate || ''}
                    onChange={(e) => handleChange('deliveryDate', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Semanas Gestación</label>
                  <input 
                    type="number" 
                    value={formData.gestationalAge || ''}
                    onChange={(e) => handleChange('gestationalAge', parseFloat(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Donadora</label>
                   <select 
                     value={formData.type}
                     onChange={(e) => handleChange('type', e.target.value)}
                     className="w-full p-2 border border-slate-300 rounded-lg"
                   >
                     {Object.values(DonorType).map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Peso Pre-gestacional (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={formData.preGestationalWeight || ''}
                    onChange={(e) => handleChange('preGestationalWeight', parseFloat(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Talla (cm)</label>
                  <input 
                    type="number" 
                    value={formData.height || ''}
                    onChange={(e) => handleChange('height', parseFloat(e.target.value))}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-500 mb-1 flex items-center gap-1">
                    <Calculator size={14}/> IMC Calculado
                  </label>
                  <div className={`w-full p-2 border rounded-lg bg-slate-100 font-bold flex justify-between items-center
                    ${formData.bmi && (formData.bmi < 18.5 || formData.bmi > 29.9) ? 'text-orange-600 border-orange-200' : 'text-slate-800'}
                  `}>
                    {formData.bmi || '--'}
                    {formData.bmi && (
                      <span className="text-[10px] uppercase font-normal ml-2">
                        {formData.bmi < 18.5 ? 'Bajo Peso' : formData.bmi > 24.9 ? 'Sobrepeso' : 'Normal'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: LABS & CLINICAL */}
          <div className={activeSection === 3 ? 'block space-y-6' : 'hidden'}>
             <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2 flex justify-between">
                  <span>Tamizaje Serológico</span>
                  <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded">Vigencia: 6 meses</span>
                </h3>
                
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="px-4 py-3">Estudio</th>
                        <th className="px-4 py-3">Resultado</th>
                        <th className="px-4 py-3">Fecha Toma</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formData.labResults?.map((lab, idx) => (
                        <tr key={idx} className="bg-white">
                          <td className="px-4 py-3 font-medium">{lab.testName}</td>
                          <td className="px-4 py-3">
                             <select 
                               value={lab.result}
                               onChange={(e) => handleLabChange(idx, 'result', e.target.value)}
                               className={`p-1 rounded border text-sm font-semibold
                                ${lab.result === 'Reactivo' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}
                               `}
                             >
                               <option value="No Reactivo">No Reactivo</option>
                               <option value="Reactivo">Reactivo ⚠️</option>
                             </select>
                          </td>
                          <td className="px-4 py-3">
                            <input 
                              type="date"
                              value={lab.date}
                              onChange={(e) => handleLabChange(idx, 'date', e.target.value)}
                              className="border border-slate-300 rounded p-1 text-sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Classification Check */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                  <FileCheck className="text-blue-500 mt-1" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">Criterio Clínico</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Si algún resultado es "Reactivo", la donadora será marcada automáticamente como <strong>No Apta</strong> y su leche descartada.
                    </p>
                  </div>
                </div>
             </div>
          </div>

          {/* SECTION 4: CONSENT */}
          <div className={activeSection === 4 ? 'block space-y-6' : 'hidden'}>
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
               <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Consentimiento Informado</h3>
               
               <div className="space-y-4">
                 <p className="text-sm text-slate-600 leading-relaxed p-4 bg-slate-50 rounded-lg border border-slate-100">
                   Yo, <strong>{formData.fullName || '______________________'}</strong>, acepto donar voluntariamente el excedente de mi leche para ser procesada y distribuida por el Banco de Leche. Declaro que la información proporcionada es verídica y autorizo la realización de los estudios serológicos necesarios.
                 </p>
                 
                 <div className="flex items-start gap-3 mt-4">
                   <input 
                     type="checkbox" 
                     id="consent"
                     checked={formData.consentSigned}
                     onChange={(e) => handleChange('consentSigned', e.target.checked)}
                     className="mt-1 h-5 w-5 text-pink-600 border-slate-300 rounded focus:ring-pink-500"
                   />
                   <div className="flex-1">
                     <label htmlFor="consent" className="text-sm font-medium text-slate-900 cursor-pointer">
                       Confirmo que he leído y firmado el Consentimiento Informado Físico
                     </label>
                     {errors.consentSigned && <p className="text-xs text-red-500 mt-1">{errors.consentSigned}</p>}
                   </div>
                 </div>

                 <div className="mt-4">
                   <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Firma</label>
                   <input 
                     type="date"
                     value={formData.consentDate || new Date().toISOString().split('T')[0]}
                     onChange={(e) => handleChange('consentDate', e.target.value)}
                     className="w-full md:w-1/3 p-2 border border-slate-300 rounded-lg"
                   />
                 </div>
               </div>

               <div className="mt-8 pt-6 border-t border-slate-100">
                 <label className="block text-sm font-medium text-slate-700 mb-2">Estado Inicial</label>
                 <select 
                   value={formData.status}
                   onChange={(e) => handleChange('status', e.target.value)}
                   className="w-full md:w-1/3 p-2 border border-slate-300 rounded-lg font-medium"
                 >
                   {Object.values(DonorStatus).map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
                 {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status}</p>}
               </div>
            </div>
          </div>

        </form>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
        <button 
          type="button" 
          onClick={onCancel}
          className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
        >
          Cancelar
        </button>
        <div className="flex gap-3">
          {activeSection > 1 && (
            <button 
              type="button" 
              onClick={() => setActiveSection(p => p - 1)}
              className="px-6 py-2 text-slate-600 font-medium border border-slate-300 hover:bg-slate-50 rounded-lg"
            >
              Anterior
            </button>
          )}
          {activeSection < 4 ? (
             <button 
               type="button" 
               onClick={() => setActiveSection(p => p + 1)}
               className="px-6 py-2 bg-slate-800 text-white font-medium hover:bg-slate-700 rounded-lg shadow-sm"
             >
               Siguiente
             </button>
          ) : (
             <button 
               onClick={handleSubmit}
               className="px-8 py-2 bg-pink-600 text-white font-bold hover:bg-pink-700 rounded-lg shadow-md flex items-center gap-2"
             >
               <Save size={18} />
               Guardar Expediente
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorForm;