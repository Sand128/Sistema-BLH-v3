import React, { useState, useEffect } from 'react';
import { Save, X, AlertTriangle, FileCheck, Calculator, Calendar, Activity, ClipboardList, Plus, Trash2, Pill } from 'lucide-react';
import { Donor, DonorType, DonorStatus, LabResult, Medication } from '../types';
import { HOSPITAL_CATALOG } from '../constants/catalogs';

interface DonorFormProps {
  initialData?: Partial<Donor>;
  onSubmit: (data: Donor) => void;
  onCancel: () => void;
  isEditMode?: boolean;
}

const RISK_ITEMS = [
  { key: 'transfusions', label: 'Transfusiones' },
  { key: 'tattoos', label: 'Tatuajes' },
  { key: 'piercings', label: 'Perforaciones' },
  { key: 'acupuncture', label: 'Acupuntura' },
  { key: 'needleStick', label: 'Accidentes con agujas' },
  { key: 'others', label: 'Otros' },
];

const DonorForm: React.FC<DonorFormProps> = ({ initialData, onSubmit, onCancel, isEditMode = false }) => {
  // Initial state setup with default values and extended 463-24 fields
  const [formData, setFormData] = useState<Partial<Donor>>({
    status: DonorStatus.PENDING,
    type: DonorType.HOMOLOGOUS_INTERNAL,
    consentSigned: false,
    registrationDate: new Date().toISOString().split('T')[0],
    folio: `BLH-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3,'0')}`,
    surplusMilk: true,
    risks: {
      transfusions: false, tattoos: false, piercings: false,
      acupuncture: false, needleStick: false, others: false
    },
    riskDetails: {}, // Stores specifications and time per risk
    habits: {
      alcohol: false, tobacco: false, coffee: false, drugs: false
    },
    takingMedication: false,
    medications: [],
    gynObs: {
      pregnancies: 1, births: 1, cSections: 0, abortions: 0, sexualPartners: 1
    },
    staff: {
      interviewerName: '',
      elaboratedByName: ''
    },
    labResults: [
      { id: '1', testName: 'VIH', result: 'No Reactivo', date: new Date().toISOString().split('T')[0] },
      { id: '2', testName: 'VDRL', result: 'No Reactivo', date: new Date().toISOString().split('T')[0] },
      { id: '3', testName: 'Hepatitis B', result: 'No Reactivo', date: new Date().toISOString().split('T')[0] },
      { id: '4', testName: 'Hepatitis C', result: 'No Reactivo', date: new Date().toISOString().split('T')[0] },
    ],
    bloodGroup: '',
    obstetricEventType: '',
    ...initialData
  });

  const [activeSection, setActiveSection] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-calculate BMI
  useEffect(() => {
    if (formData.currentWeight && formData.height) {
      const heightM = formData.height / 100;
      const bmi = parseFloat((formData.currentWeight / (heightM * heightM)).toFixed(2));
      setFormData(prev => ({ ...prev, bmi }));
    }
  }, [formData.currentWeight, formData.height]);

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
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNestedChange = (parent: 'risks' | 'habits' | 'gynObs' | 'staff', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const handleRiskDetailChange = (key: string, field: 'specification' | 'timeElapsed', value: string) => {
    setFormData(prev => ({
      ...prev,
      riskDetails: {
        ...prev.riskDetails,
        [key]: {
          ...prev.riskDetails?.[key],
          [field]: value
        }
      }
    }));
  };

  // --- MEDICATION HANDLERS ---
  const handleAddMedication = () => {
    const newMed: Medication = {
      id: Date.now().toString(),
      name: '',
      dose: '',
      frequency: '',
      reason: '',
      startDate: ''
    };
    setFormData(prev => ({
      ...prev,
      medications: [...(prev.medications || []), newMed]
    }));
  };

  const handleMedicationChange = (id: string, field: keyof Medication, value: string) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications?.map(med => 
        med.id === id ? { ...med, [field]: value } : med
      )
    }));
  };

  const handleRemoveMedication = (id: string) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications?.filter(med => med.id !== id)
    }));
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
    if (!formData.expediente) newErrors.expediente = 'El expediente es obligatorio';
    if (!formData.contactPhone) newErrors.contactPhone = 'El teléfono es obligatorio';
    if (!formData.birthDate) newErrors.birthDate = 'Fecha de nacimiento requerida';
    if (!formData.bloodGroup) newErrors.bloodGroup = 'Grupo Sanguíneo es obligatorio';
    if (!formData.obstetricEventType) newErrors.obstetricEventType = 'Tipo de evento obstétrico obligatorio';
    
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

  // Helper to check if obstetric event is custom
  const isCustomObstetricEvent = 
    formData.obstetricEventType && 
    !['Parto Eutócico', 'Cesárea', 'Parto Instrumentado'].includes(formData.obstetricEventType);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {isEditMode ? 'Editar Expediente de Donadora' : 'Registro de Nueva Donadora'}
          </h2>
          <p className="text-xs text-slate-500 font-mono">Formato Oficial 453-24 ISEM - Registro BLH</p>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-sm font-mono bg-white border border-slate-200 px-3 py-1 rounded-lg text-slate-600">
             Folio: {formData.folio}
           </span>
           <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full text-slate-500">
             <X size={20} />
           </button>
        </div>
      </div>

      {/* Progress / Sections Nav */}
      <div className="flex border-b border-slate-200 bg-white sticky top-0 z-10 overflow-x-auto">
        {[
          { id: 1, label: '1. Identificación' },
          { id: 2, label: '2. Perinatal' },
          { id: 3, label: '3. Historial Médico' },
          { id: 4, label: '4. Laboratorio' },
          { id: 5, label: '5. Entrevista' }
        ].map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex-1 min-w-[120px] py-3 text-sm font-medium border-b-2 transition-colors ${
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
        <form id="donor-form" onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8">
          
          {/* --- SECTION 1: IDENTIFICATION --- */}
          <div className={activeSection === 1 ? 'block space-y-6' : 'hidden'}>
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm animate-in fade-in">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">1. Ficha de Identificación</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">No. Expediente *</label>
                  <input 
                    type="text" 
                    value={formData.expediente || ''}
                    onChange={(e) => handleChange('expediente', e.target.value)}
                    className={`w-full p-2 border rounded-lg uppercase ${errors.expediente ? 'border-red-500' : 'border-slate-300'}`}
                    placeholder="Ej. EXP-2024-001"
                  />
                  {errors.expediente && <span className="text-xs text-red-500">{errors.expediente}</span>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo *</label>
                  <input 
                    type="text" 
                    value={formData.fullName || ''}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none ${errors.fullName ? 'border-red-500' : 'border-slate-300'}`}
                    placeholder="Apellidos y Nombres"
                  />
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

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Nacimiento *</label>
                    <input 
                      type="date" 
                      value={formData.birthDate || ''}
                      onChange={(e) => handleChange('birthDate', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="w-20">
                    <label className="block text-sm font-medium text-slate-500 mb-1">Edad</label>
                    <input type="text" disabled value={formData.age || ''} className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-center font-bold" />
                  </div>
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

                {/* NUEVO CAMPO: GRUPO SANGUÍNEO */}
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Grupo Sanguíneo *</label>
                   <select 
                     value={formData.bloodGroup || ''} 
                     onChange={(e) => handleChange('bloodGroup', e.target.value)} 
                     className={`w-full p-2 border rounded-lg ${errors.bloodGroup ? 'border-red-500' : 'border-slate-300'}`}
                   >
                     <option value="">[Seleccionar...]</option>
                     {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Desconocido'].map(bg => (
                       <option key={bg} value={bg}>{bg}</option>
                     ))}
                   </select>
                   {errors.bloodGroup && <span className="text-xs text-red-500">{errors.bloodGroup}</span>}
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Ocupación</label>
                   <input type="text" value={formData.occupation || ''} onChange={(e) => handleChange('occupation', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Estado Civil</label>
                   <select value={formData.civilStatus || ''} onChange={(e) => handleChange('civilStatus', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg">
                     <option value="">Seleccione...</option>
                     <option value="Casada">Casada</option>
                     <option value="Soltera">Soltera</option>
                     <option value="Unión Libre">Unión Libre</option>
                   </select>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Religión</label>
                   <input type="text" value={formData.religion || ''} onChange={(e) => handleChange('religion', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-slate-700 mb-1">Dirección Completa</label>
                   <input type="text" value={formData.address || ''} onChange={(e) => handleChange('address', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Referencias Domicilio</label>
                   <input type="text" value={formData.referenceAddress || ''} onChange={(e) => handleChange('referenceAddress', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" placeholder="Entre calles, color de fachada..." />
                </div>
              </div>
            </div>
          </div>

          {/* --- SECTION 2: PERINATAL --- */}
          <div className={activeSection === 2 ? 'block space-y-6' : 'hidden'}>
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm animate-in fade-in">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">2. Antecedentes Perinatales</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Institución de Control Perinatal</label>
                  <select
                    value={formData.perinatalCareInstitution || ''}
                    onChange={(e) => handleChange('perinatalCareInstitution', e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="">Seleccione Institución...</option>
                    {HOSPITAL_CATALOG.map((group) => (
                      <optgroup key={group.category} label={group.category}>
                        {group.options.map(hospital => (
                          <option key={hospital} value={hospital}>{hospital}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Parto/Cesárea</label>
                  <input type="date" value={formData.deliveryDate || ''} onChange={(e) => handleChange('deliveryDate', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>

                {/* NUEVO CAMPO: TIPO DE EVENTO OBSTÉTRICO */}
                <div className="md:col-span-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Tipo de Evento Obstétrico *</label>
                  <div className="flex flex-wrap gap-6">
                    {['Parto Eutócico', 'Cesárea', 'Parto Instrumentado'].map(option => (
                      <label key={option} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="obstetricEventType"
                          value={option}
                          checked={formData.obstetricEventType === option}
                          onChange={(e) => handleChange('obstetricEventType', e.target.value)}
                          className="w-4 h-4 text-pink-600 focus:ring-pink-500"
                        />
                        <span className="text-sm text-slate-700">{option}</span>
                      </label>
                    ))}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="obstetricEventType"
                        value="Otro"
                        checked={isCustomObstetricEvent}
                        onChange={() => handleChange('obstetricEventType', '')} // Clear to allow typing
                        className="w-4 h-4 text-pink-600 focus:ring-pink-500"
                      />
                      <span className="text-sm text-slate-700">Otro:</span>
                      <input 
                        type="text"
                        className="border-b border-slate-400 bg-transparent outline-none px-1 text-sm w-40 disabled:opacity-50"
                        placeholder="Especificar..."
                        disabled={!isCustomObstetricEvent && !!formData.obstetricEventType && ['Parto Eutócico', 'Cesárea', 'Parto Instrumentado'].includes(formData.obstetricEventType)}
                        value={isCustomObstetricEvent ? formData.obstetricEventType : ''}
                        onChange={(e) => handleChange('obstetricEventType', e.target.value)}
                        onFocus={() => {
                           if (!isCustomObstetricEvent) handleChange('obstetricEventType', ''); // Switch to custom mode on focus
                        }}
                      />
                    </label>
                  </div>
                  {errors.obstetricEventType && <span className="text-xs text-red-500 mt-1 block">{errors.obstetricEventType}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Edad Gestacional al Nacer (Semanas)</label>
                  <input type="number" value={formData.gestationalAge || ''} onChange={(e) => handleChange('gestationalAge', parseFloat(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Edad Actual Lactante (Semanas)</label>
                  <input type="number" value={formData.infantAgeWeeks || ''} onChange={(e) => handleChange('infantAgeWeeks', parseFloat(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                   <label className="flex items-center gap-2 mb-2 cursor-pointer">
                     <input type="checkbox" checked={formData.infantHospitalized || false} onChange={(e) => handleChange('infantHospitalized', e.target.checked)} className="w-4 h-4 text-pink-600 rounded"/>
                     <span className="text-sm font-bold text-slate-700">¿Lactante Hospitalizado?</span>
                   </label>
                   {formData.infantHospitalized && (
                     <input type="text" placeholder="Servicio (ej. UCIN)" value={formData.hospitalizationService || ''} onChange={(e) => handleChange('hospitalizationService', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white" />
                   )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Peso Pregestacional (kg)</label>
                  <input type="number" step="0.1" value={formData.preGestationalWeight || ''} onChange={(e) => handleChange('preGestationalWeight', parseFloat(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Peso Actual (kg)</label>
                  <input type="number" step="0.1" value={formData.currentWeight || ''} onChange={(e) => handleChange('currentWeight', parseFloat(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Talla (cm)</label>
                  <input type="number" value={formData.height || ''} onChange={(e) => handleChange('height', parseFloat(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-500 mb-1 flex items-center gap-1"><Calculator size={14}/> IMC</label>
                  <div className={`w-full p-2 border rounded-lg bg-slate-100 font-bold text-center ${formData.bmi && (formData.bmi < 18.5 || formData.bmi > 29.9) ? 'text-orange-600 border-orange-200' : 'text-slate-800'}`}>
                    {formData.bmi || '--'}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                 <label className="flex items-center gap-2 mb-3 cursor-pointer">
                   <input type="checkbox" checked={formData.pregnancyInfections || false} onChange={(e) => handleChange('pregnancyInfections', e.target.checked)} className="w-4 h-4 text-pink-600 rounded"/>
                   <span className="text-sm font-bold text-slate-700">¿Infecciones durante el embarazo?</span>
                 </label>
                 {formData.pregnancyInfections && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                      <input type="text" placeholder="Trimestre (ej. 2do)" value={formData.infectionsTrimester || ''} onChange={(e) => handleChange('infectionsTrimester', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" />
                      <input type="text" placeholder="Detalle complicaciones" value={formData.pregnancyComplications || ''} onChange={(e) => handleChange('pregnancyComplications', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" />
                   </div>
                 )}
              </div>
            </div>
          </div>

          {/* --- SECTION 3: PATHOLOGICAL & GYN-OBS --- */}
          <div className={activeSection === 3 ? 'block space-y-6' : 'hidden'}>
             <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm animate-in fade-in">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">3. Historial Médico y Gineco-Obstétrico</h3>
                
                {/* Risk Factors Table */}
                <div className="mb-8">
                  <h4 className="text-sm font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-pink-500"/> Factores de Riesgo (Últimos 12 meses)
                  </h4>
                  
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-100 text-xs font-bold text-slate-700 uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 border-r border-slate-200 w-1/4">Factor de Riesgo</th>
                          <th className="px-4 py-3 border-r border-slate-200 text-center w-24">Sí / No</th>
                          <th className="px-4 py-3 border-r border-slate-200 w-1/3">Especificaciones</th>
                          <th className="px-4 py-3">Tiempo Transcurrido</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {RISK_ITEMS.map((item) => {
                          const isChecked = (formData.risks as any)?.[item.key] || false;
                          return (
                            <tr key={item.key} className="bg-white hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 border-r border-slate-100 font-medium text-slate-700">
                                {item.label}
                              </td>
                              <td className="px-4 py-3 border-r border-slate-100 text-center">
                                <input 
                                  type="checkbox" 
                                  checked={isChecked}
                                  onChange={(e) => handleNestedChange('risks', item.key, e.target.checked)}
                                  className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500 cursor-pointer"
                                />
                              </td>
                              <td className="px-4 py-3 border-r border-slate-100">
                                <input 
                                  type="text" 
                                  disabled={!isChecked}
                                  placeholder={isChecked ? "Detalles..." : ""}
                                  className={`w-full border-b border-slate-300 bg-transparent focus:outline-none focus:border-pink-500 px-1 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700`}
                                  value={formData.riskDetails?.[item.key]?.specification || ''}
                                  onChange={(e) => handleRiskDetailChange(item.key, 'specification', e.target.value)}
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input 
                                  type="text" 
                                  disabled={!isChecked}
                                  placeholder={isChecked ? "Ej. 6 meses" : ""}
                                  className={`w-full border-b border-slate-300 bg-transparent focus:outline-none focus:border-pink-500 px-1 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700`}
                                  value={formData.riskDetails?.[item.key]?.timeElapsed || ''}
                                  onChange={(e) => handleRiskDetailChange(item.key, 'timeElapsed', e.target.value)}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones Médicas Generales</label>
                    <textarea 
                      rows={2}
                      className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-200 outline-none"
                      placeholder="Notas adicionales sobre el historial clínico..."
                      value={formData.medicalObservations || ''}
                      onChange={(e) => handleChange('medicalObservations', e.target.value)}
                    />
                  </div>
                </div>

                {/* Habits */}
                <div className="mb-6 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700 uppercase mb-3">Hábitos de Consumo</h4>
                  <div className="flex flex-wrap gap-4">
                    {[
                      { key: 'alcohol', label: 'Alcohol' },
                      { key: 'tobacco', label: 'Tabaco' },
                      { key: 'coffee', label: 'Café' },
                      { key: 'drugs', label: 'Drogas' }
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors">
                        <input type="checkbox" checked={(formData.habits as any)?.[item.key] || false} onChange={(e) => handleNestedChange('habits', item.key, e.target.checked)} className="w-4 h-4 text-pink-600 rounded"/>
                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                  
                  {/* --- NUEVO MÓDULO TRATAMIENTO FARMACOLÓGICO --- */}
                  <div className="mt-6 border-t border-slate-100 pt-6">
                    <h4 className="text-sm font-bold text-slate-700 uppercase mb-3 flex items-center gap-2">
                      <Pill size={16} className="text-blue-500"/> Tratamiento Farmacológico Actual
                    </h4>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-sm text-slate-700 font-medium">¿Se encuentra bajo algún tratamiento médico?</span>
                      <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                        <button 
                          type="button"
                          onClick={() => handleChange('takingMedication', true)}
                          className={`px-4 py-1 rounded text-sm font-bold transition-all ${formData.takingMedication ? 'bg-pink-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          SÍ
                        </button>
                        <button 
                          type="button"
                          onClick={() => handleChange('takingMedication', false)}
                          className={`px-4 py-1 rounded text-sm font-bold transition-all ${!formData.takingMedication ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                          NO
                        </button>
                      </div>
                    </div>

                    {formData.takingMedication && (
                      <div className="animate-in fade-in slide-in-from-top-2">
                        <div className="border border-slate-200 rounded-lg overflow-hidden mb-3">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-100 text-xs font-bold text-slate-700 border-b border-slate-200">
                              <tr>
                                <th className="px-3 py-2 text-left">Nombre del Fármaco</th>
                                <th className="px-3 py-2 text-left">Dosis</th>
                                <th className="px-3 py-2 text-left">Frecuencia</th>
                                <th className="px-3 py-2 text-left">Motivo</th>
                                <th className="px-3 py-2 text-center w-24">Inicio</th>
                                <th className="px-3 py-2 text-center w-24">Término</th>
                                <th className="px-2 py-2 w-10"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {/* Ejemplo visual si está vacío */}
                              {(!formData.medications || formData.medications.length === 0) && (
                                <tr className="bg-slate-50/50">
                                  <td className="px-3 py-2"><input disabled placeholder="Ej. Paracetamol" className="w-full bg-transparent border-b border-dashed border-slate-300 text-slate-400 italic text-xs"/></td>
                                  <td className="px-3 py-2"><input disabled placeholder="500 mg" className="w-full bg-transparent border-b border-dashed border-slate-300 text-slate-400 italic text-xs"/></td>
                                  <td className="px-3 py-2"><input disabled placeholder="Cada 8 hrs" className="w-full bg-transparent border-b border-dashed border-slate-300 text-slate-400 italic text-xs"/></td>
                                  <td className="px-3 py-2"><input disabled placeholder="Dolor de cabeza" className="w-full bg-transparent border-b border-dashed border-slate-300 text-slate-400 italic text-xs"/></td>
                                  <td className="px-3 py-2"><input disabled placeholder="dd/mm/aaaa" className="w-full bg-transparent border-b border-dashed border-slate-300 text-slate-400 italic text-xs text-center"/></td>
                                  <td className="px-3 py-2"><input disabled placeholder="dd/mm/aaaa" className="w-full bg-transparent border-b border-dashed border-slate-300 text-slate-400 italic text-xs text-center"/></td>
                                  <td></td>
                                </tr>
                              )}
                              
                              {formData.medications?.map((med) => (
                                <tr key={med.id} className="group hover:bg-slate-50 transition-colors">
                                  <td className="px-3 py-2">
                                    <input 
                                      type="text" 
                                      value={med.name}
                                      onChange={(e) => handleMedicationChange(med.id, 'name', e.target.value)}
                                      className="w-full border border-slate-200 rounded px-2 py-1 text-slate-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none"
                                      placeholder="Nombre"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input 
                                      type="text" 
                                      value={med.dose}
                                      onChange={(e) => handleMedicationChange(med.id, 'dose', e.target.value)}
                                      className="w-full border border-slate-200 rounded px-2 py-1 text-slate-700 focus:border-pink-500 outline-none"
                                      placeholder="Dosis"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input 
                                      type="text" 
                                      value={med.frequency}
                                      onChange={(e) => handleMedicationChange(med.id, 'frequency', e.target.value)}
                                      className="w-full border border-slate-200 rounded px-2 py-1 text-slate-700 focus:border-pink-500 outline-none"
                                      placeholder="Frecuencia"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input 
                                      type="text" 
                                      value={med.reason}
                                      onChange={(e) => handleMedicationChange(med.id, 'reason', e.target.value)}
                                      className="w-full border border-slate-200 rounded px-2 py-1 text-slate-700 focus:border-pink-500 outline-none"
                                      placeholder="Motivo"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input 
                                      type="date" 
                                      value={med.startDate}
                                      onChange={(e) => handleMedicationChange(med.id, 'startDate', e.target.value)}
                                      className="w-full border border-slate-200 rounded px-1 py-1 text-slate-700 focus:border-pink-500 outline-none text-xs"
                                    />
                                  </td>
                                  <td className="px-3 py-2">
                                    <input 
                                      type="date" 
                                      value={med.endDate || ''}
                                      onChange={(e) => handleMedicationChange(med.id, 'endDate', e.target.value)}
                                      className="w-full border border-slate-200 rounded px-1 py-1 text-slate-700 focus:border-pink-500 outline-none text-xs"
                                    />
                                  </td>
                                  <td className="px-2 py-2 text-center">
                                    <button 
                                      type="button" 
                                      onClick={() => handleRemoveMedication(med.id)}
                                      className="text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-slate-500 italic">* Especifique todos los medicamentos recetados y de venta libre.</p>
                          <button 
                            type="button"
                            onClick={handleAddMedication}
                            className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 py-1 px-3 rounded hover:bg-blue-50 transition-colors"
                          >
                            <Plus size={16} /> Agregar otro medicamento
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gyn Obs */}
                <div className="pt-4 border-t border-slate-100">
                   <h4 className="text-sm font-bold text-slate-700 uppercase mb-3">Antecedentes Gineco-Obstétricos</h4>
                   <div className="grid grid-cols-3 md:grid-cols-5 gap-4 text-center">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Gesta</label>
                        <input type="number" min="0" value={formData.gynObs?.pregnancies} onChange={(e) => handleNestedChange('gynObs', 'pregnancies', parseInt(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg text-center font-bold text-slate-700" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Para</label>
                        <input type="number" min="0" value={formData.gynObs?.births} onChange={(e) => handleNestedChange('gynObs', 'births', parseInt(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg text-center font-bold text-slate-700" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Cesáreas</label>
                        <input type="number" min="0" value={formData.gynObs?.cSections} onChange={(e) => handleNestedChange('gynObs', 'cSections', parseInt(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg text-center font-bold text-slate-700" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Abortos</label>
                        <input type="number" min="0" value={formData.gynObs?.abortions} onChange={(e) => handleNestedChange('gynObs', 'abortions', parseInt(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg text-center font-bold text-slate-700" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Parejas Sex.</label>
                        <input type="number" min="0" value={formData.gynObs?.sexualPartners} onChange={(e) => handleNestedChange('gynObs', 'sexualPartners', parseInt(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg text-center font-bold text-slate-700" />
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Método Planificación Familiar</label>
                        <input type="text" value={formData.gynObs?.planningMethod || ''} onChange={(e) => handleNestedChange('gynObs', 'planningMethod', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Antecedentes Anormales</label>
                        <input type="text" placeholder="Especificar si existen" value={formData.gynObs?.abnormalHistory || ''} onChange={(e) => handleNestedChange('gynObs', 'abnormalHistory', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" />
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* --- SECTION 4: LABS --- */}
          <div className={activeSection === 4 ? 'block space-y-6' : 'hidden'}>
             <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm animate-in fade-in">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2 flex justify-between">
                  <span>4. Exámenes de Laboratorio</span>
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
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                  <FileCheck className="text-blue-500 mt-1" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">Criterio Clínico</p>
                    <p className="text-xs text-blue-600 mt-1">Si algún resultado es "Reactivo", la donadora será marcada automáticamente como <strong>No Apta</strong>.</p>
                  </div>
                </div>
             </div>
          </div>

          {/* --- SECTION 5: INTERVIEW & VALIDATION --- */}
          <div className={activeSection === 5 ? 'block space-y-6' : 'hidden'}>
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm animate-in fade-in">
               <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">5. Entrevista y Validación</h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 
                 {/* Donation Type */}
                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Clasificación Donación</label>
                   <select value={formData.type} onChange={(e) => handleChange('type', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg">
                     {Object.values(DonorType).map(t => <option key={t} value={t}>{t}</option>)}
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Categoría Operativa</label>
                   <select value={formData.donorCategory || 'Interna'} onChange={(e) => handleChange('donorCategory', e.target.value as any)} className="w-full p-2 border border-slate-300 rounded-lg">
                     <option value="Interna">Interna</option>
                     <option value="Externa">Externa</option>
                     <option value="En Casa">En Casa</option>
                     <option value="Lactario Hospitalario">Lactario Hospitalario</option>
                   </select>
                 </div>

                 <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Motivo Donación</label>
                   <div className="flex gap-4 items-center h-10">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.surplusMilk} onChange={(e) => handleChange('surplusMilk', e.target.checked)} className="w-4 h-4 text-pink-600 rounded"/>
                        <span className="text-sm text-slate-700">Excedente de Leche</span>
                      </label>
                   </div>
                   {!formData.surplusMilk && (
                     <input type="text" placeholder="Especificar otro motivo" value={formData.donationReason || ''} onChange={(e) => handleChange('donationReason', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg mt-2" />
                   )}
                 </div>

                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 md:col-span-2">
                    <h4 className="text-sm font-bold text-slate-700 mb-2">Dictamen Final</h4>
                    <select value={formData.status} onChange={(e) => handleChange('status', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg font-bold">
                       {Object.values(DonorStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {formData.status === DonorStatus.REJECTED && (
                      <textarea placeholder="Motivo de No Aceptación (Requerido)" value={formData.rejectionReason || ''} onChange={(e) => handleChange('rejectionReason', e.target.value)} className="w-full p-2 border border-red-300 rounded-lg mt-2 bg-white" rows={2}/>
                    )}
                 </div>

                 {/* Signatures */}
                 <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Responsable Entrevista</label>
                      <input type="text" placeholder="Nombre y Rúbrica" value={formData.staff?.interviewerName || ''} onChange={(e) => handleNestedChange('staff', 'interviewerName', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Elaboró</label>
                      <input type="text" placeholder="Nombre Personal Responsable" value={formData.staff?.elaboratedByName || ''} onChange={(e) => handleNestedChange('staff', 'elaboratedByName', e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" />
                    </div>
                 </div>

                 {/* Consent Check */}
                 <div className="md:col-span-2 mt-4">
                   <div className="flex items-start gap-3 p-4 bg-pink-50 border border-pink-100 rounded-lg">
                     <input type="checkbox" id="consent" checked={formData.consentSigned} onChange={(e) => handleChange('consentSigned', e.target.checked)} className="mt-1 h-5 w-5 text-pink-600 border-slate-300 rounded focus:ring-pink-500"/>
                     <div>
                       <label htmlFor="consent" className="text-sm font-bold text-slate-800 cursor-pointer">Firma de Consentimiento Informado</label>
                       <p className="text-xs text-slate-600">Confirmo que la donadora ha firmado el documento legal correspondiente.</p>
                     </div>
                   </div>
                 </div>

               </div>
            </div>
          </div>

        </form>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
        <button type="button" onClick={onCancel} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
        <div className="flex gap-3">
          {activeSection > 1 && (
            <button type="button" onClick={() => setActiveSection(p => p - 1)} className="px-6 py-2 text-slate-600 font-medium border border-slate-300 hover:bg-slate-50 rounded-lg">Anterior</button>
          )}
          {activeSection < 5 ? (
             <button type="button" onClick={() => setActiveSection(p => p + 1)} className="px-6 py-2 bg-slate-800 text-white font-medium hover:bg-slate-700 rounded-lg shadow-sm">Siguiente</button>
          ) : (
             <button onClick={handleSubmit} className="px-8 py-2 bg-pink-600 text-white font-bold hover:bg-pink-700 rounded-lg shadow-md flex items-center gap-2">
               <Save size={18} /> Guardar Expediente
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DonorForm;