import React, { useState } from 'react';
import { Save, X, Baby, Activity, FileText } from 'lucide-react';
import { Receiver, Prescription, CaloricClassification } from '../types';

interface ReceiverFormProps {
  onSubmit: (data: Receiver) => void;
  onCancel: () => void;
}

const ReceiverForm: React.FC<ReceiverFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Receiver>>({
    status: 'Estable',
    allergies: [],
    prescription: {
      volumeTotalPerDay: 120,
      frequency: 8,
      volumePerTake: 15,
      milkTypePreference: 'Heteróloga',
      caloricRequirement: CaloricClassification.NORMOCALORIC,
      prescribedBy: 'Dr. Neonatólogo',
      lastUpdate: new Date().toISOString()
    }
  });

  const handleChange = (field: keyof Receiver, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrescriptionChange = (field: keyof Prescription, value: any) => {
    setFormData(prev => {
      const updatedPrescription = { ...prev.prescription!, [field]: value };
      
      // Auto-calc volume per take
      if (field === 'volumeTotalPerDay' || field === 'frequency') {
        const vol = field === 'volumeTotalPerDay' ? value : updatedPrescription.volumeTotalPerDay;
        const freq = field === 'frequency' ? value : updatedPrescription.frequency;
        if (freq > 0) {
            updatedPrescription.volumePerTake = Math.round(vol / freq);
        }
      }
      
      return { ...prev, prescription: updatedPrescription };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock ID generation
    const newReceiver: Receiver = {
      ...formData as Receiver,
      id: Math.random().toString(36).substr(2, 9),
      expediente: `RN-${Math.floor(Math.random() * 1000)}`
    };
    onSubmit(newReceiver);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-[calc(100vh-140px)]">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Baby className="text-pink-500" />
            Registro de Receptor
          </h2>
          <p className="text-xs text-slate-500 font-mono">Ingreso a UCIN / Neonatología</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          
          {/* Section 1: Clinical Data */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
               <FileText size={18} className="text-blue-500"/> Identificación y Clínica
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo *</label>
                   <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg"
                     value={formData.fullName || ''} onChange={e => handleChange('fullName', e.target.value)} />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Nacimiento *</label>
                   <input required type="date" className="w-full p-2 border border-slate-300 rounded-lg"
                     value={formData.birthDate || ''} onChange={e => handleChange('birthDate', e.target.value)} />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Peso Actual (kg) *</label>
                   <input required type="number" step="0.01" className="w-full p-2 border border-slate-300 rounded-lg"
                     value={formData.weightKg || ''} onChange={e => handleChange('weightKg', parseFloat(e.target.value))} />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Edad Gestacional (semanas)</label>
                   <input type="number" className="w-full p-2 border border-slate-300 rounded-lg"
                     value={formData.gestationalAge || ''} onChange={e => handleChange('gestationalAge', parseFloat(e.target.value))} />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación (Cama/Incubadora)</label>
                   <input type="text" className="w-full p-2 border border-slate-300 rounded-lg"
                     value={formData.location || ''} onChange={e => handleChange('location', e.target.value)} />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Diagnóstico Principal</label>
                   <input type="text" className="w-full p-2 border border-slate-300 rounded-lg"
                     value={formData.diagnosis || ''} onChange={e => handleChange('diagnosis', e.target.value)} />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Estado Clínico</label>
                   <select className="w-full p-2 border border-slate-300 rounded-lg"
                     value={formData.status} onChange={e => handleChange('status', e.target.value)}>
                     <option value="Estable">Estable</option>
                     <option value="Observación">Observación</option>
                     <option value="Crítico">Crítico</option>
                   </select>
                </div>
             </div>
          </div>

          {/* Section 2: Prescription */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
               <Activity size={18} className="text-emerald-500"/> Prescripción Nutricional Inicial
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Volumen Total / Día (mL)</label>
                   <input type="number" className="w-full p-2 border border-slate-300 rounded-lg"
                     value={formData.prescription?.volumeTotalPerDay} 
                     onChange={e => handlePrescriptionChange('volumeTotalPerDay', parseFloat(e.target.value))} />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Frecuencia (tomas/día)</label>
                   <input type="number" className="w-full p-2 border border-slate-300 rounded-lg"
                     value={formData.prescription?.frequency} 
                     onChange={e => handlePrescriptionChange('frequency', parseFloat(e.target.value))} />
                </div>
                <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100 text-center">
                   <span className="block text-xs text-emerald-600 font-bold uppercase">Volumen por Toma</span>
                   <span className="text-2xl font-bold text-emerald-800">{formData.prescription?.volumePerTake} mL</span>
                </div>
                
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Preferencia Leche</label>
                   <select className="w-full p-2 border border-slate-300 rounded-lg"
                     value={formData.prescription?.milkTypePreference}
                     onChange={e => handlePrescriptionChange('milkTypePreference', e.target.value)}>
                     <option value="Heteróloga">Heteróloga (Banco)</option>
                     <option value="Homóloga">Homóloga (Madre)</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Req. Calórico</label>
                   <select className="w-full p-2 border border-slate-300 rounded-lg"
                     value={formData.prescription?.caloricRequirement}
                     onChange={e => handlePrescriptionChange('caloricRequirement', e.target.value)}>
                     {Object.values(CaloricClassification).map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
             </div>
          </div>
          
        </form>
      </div>

      <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3">
        <button onClick={onCancel} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">
          Cancelar
        </button>
        <button onClick={handleSubmit} className="px-8 py-2 bg-pink-600 text-white font-bold hover:bg-pink-700 rounded-lg shadow-md flex items-center gap-2">
          <Save size={18} /> Guardar Receptor
        </button>
      </div>
    </div>
  );
};

export default ReceiverForm;