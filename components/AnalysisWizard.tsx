import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, X, Beaker, TestTube2, Save, Activity, Calculator } from 'lucide-react';
import { MilkJar, CaloricClassification, MilkStatus } from '../types';

interface AnalysisWizardProps {
  selectedJars: MilkJar[];
  onComplete: (results: MilkJar[]) => void;
  onCancel: () => void;
}

const AnalysisWizard: React.FC<AnalysisWizardProps> = ({ selectedJars, onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [analyzedJars, setAnalyzedJars] = useState<MilkJar[]>(selectedJars.map(j => ({ ...j })));

  // --- STEP 1: PHYSICAL INSPECTION LOGIC ---
  const handlePhysicalChange = (id: string, field: 'color' | 'offFlavor' | 'contamination', value: any) => {
    setAnalyzedJars(prev => prev.map(jar => {
      if (jar.id !== id) return jar;
      
      const currentPhysical = jar.analysisData?.physical || { color: 'Blanco', offFlavor: false, contamination: '' };
      const updatedPhysical = { ...currentPhysical, [field]: value };
      
      // Auto-reject logic for physical
      let newStatus = MilkStatus.TESTING; // Default while in analysis
      let rejectionReason = '';

      if (updatedPhysical.contamination || updatedPhysical.color === 'Rojo/Sangre' || updatedPhysical.color === 'Verde/Pus') {
         newStatus = MilkStatus.DISCARDED;
         rejectionReason = updatedPhysical.contamination ? `Contaminación: ${updatedPhysical.contamination}` : `Color anormal: ${updatedPhysical.color}`;
      }

      return {
        ...jar,
        status: newStatus,
        rejectionReason: newStatus === MilkStatus.DISCARDED ? rejectionReason : undefined,
        analysisData: {
          ...jar.analysisData,
          physical: updatedPhysical
        }
      };
    }));
  };

  // --- STEP 2: CHEMICAL ANALYSIS LOGIC ---
  const handleChemicalChange = (id: string, field: 'acidity' | 'creamatocrit', value: any, aliquotIndex?: number) => {
    setAnalyzedJars(prev => prev.map(jar => {
      if (jar.id !== id) return jar;

      const currentChemical = jar.analysisData?.chemical || { 
        acidityAliquots: [0,0,0], 
        acidityAverage: 0, 
        creamatocrit: 0, 
        classification: CaloricClassification.NORMOCALORIC 
      };

      let updatedChemical = { ...currentChemical };

      if (field === 'acidity' && typeof aliquotIndex === 'number') {
        const newAliquots = [...currentChemical.acidityAliquots] as [number, number, number];
        newAliquots[aliquotIndex] = parseFloat(value) || 0;
        updatedChemical.acidityAliquots = newAliquots;
        updatedChemical.acidityAverage = parseFloat(((newAliquots.reduce((a, b) => a + b, 0)) / 3).toFixed(1));
      } else if (field === 'creamatocrit') {
        updatedChemical.creamatocrit = parseFloat(value) || 0;
        // Classification Logic
        if (updatedChemical.creamatocrit < 500) updatedChemical.classification = CaloricClassification.HYPOCALORIC;
        else if (updatedChemical.creamatocrit > 700) updatedChemical.classification = CaloricClassification.HYPERCALORIC;
        else updatedChemical.classification = CaloricClassification.NORMOCALORIC;
      }

      // Auto-reject logic for Chemical
      let newStatus = jar.status;
      let rejectionReason = jar.rejectionReason;

      // Only evaluate if not already discarded in physical step
      if (jar.status !== MilkStatus.DISCARDED) {
         if (updatedChemical.acidityAverage > 8) {
           newStatus = MilkStatus.DISCARDED;
           rejectionReason = `Acidez elevada: ${updatedChemical.acidityAverage}°D`;
         } else {
           newStatus = MilkStatus.ANALYZED; // Passed!
           rejectionReason = undefined;
         }
      }

      return {
        ...jar,
        status: newStatus,
        rejectionReason,
        analysisData: {
          ...jar.analysisData,
          chemical: updatedChemical
        }
      };
    }));
  };

  const activeJarsForChemical = analyzedJars.filter(j => 
    !j.rejectionReason || !j.rejectionReason.startsWith('Contaminación') // Simple check to filter out physical rejections
  );

  const stats = {
    total: analyzedJars.length,
    passed: analyzedJars.filter(j => j.status === MilkStatus.ANALYZED).length,
    rejected: analyzedJars.filter(j => j.status === MilkStatus.DISCARDED).length,
    avgAcidity: (analyzedJars.reduce((acc, curr) => acc + (curr.analysisData?.chemical?.acidityAverage || 0), 0) / analyzedJars.length).toFixed(1)
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-[calc(100vh-140px)]">
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <TestTube2 className="text-pink-600" />
            Análisis Fisicoquímico
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-1">Lote de Análisis: {new Date().toISOString().split('T')[0]}-BATCH-{Math.floor(Math.random()*100)}</p>
        </div>
        
        {/* Stepper */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${step === 1 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] border border-current">1</span>
            Inspección Física
          </div>
          <div className="w-8 h-0.5 bg-slate-200"></div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${step === 2 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] border border-current">2</span>
            Fisicoquímico
          </div>
          <div className="w-8 h-0.5 bg-slate-200"></div>
           <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${step === 3 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
            <span className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] border border-current">3</span>
            Resumen
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        
        {/* STEP 1: PHYSICAL INSPECTION */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg mb-6 flex gap-3">
               <Activity className="text-blue-600 mt-0.5" size={20} />
               <div>
                 <h4 className="font-bold text-blue-800 text-sm">Instrucciones de Inspección</h4>
                 <p className="text-sm text-blue-700">Verifique color, olor (off-flavor) y presencia de suciedad. Los frascos rechazados aquí no pasarán a la siguiente etapa.</p>
               </div>
             </div>

             <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                   <tr>
                     <th className="px-4 py-3">Frasco</th>
                     <th className="px-4 py-3">Color</th>
                     <th className="px-4 py-3 text-center">Off-flavor</th>
                     <th className="px-4 py-3">Contaminación / Observaciones</th>
                     <th className="px-4 py-3 text-right">Estado</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {analyzedJars.map((jar) => (
                     <tr key={jar.id} className="hover:bg-slate-50">
                       <td className="px-4 py-3 font-medium text-slate-800">
                         {jar.folio}
                         <div className="text-xs text-slate-400 font-normal">{jar.donorName}</div>
                       </td>
                       <td className="px-4 py-3">
                         <select 
                           className="border border-slate-300 rounded p-1.5 text-sm w-full max-w-[140px]"
                           value={jar.analysisData?.physical?.color || 'Blanco'}
                           onChange={(e) => handlePhysicalChange(jar.id, 'color', e.target.value)}
                         >
                           <option value="Blanco">Blanco</option>
                           <option value="Amarillo">Amarillo</option>
                           <option value="Verdoso">Verdoso</option>
                           <option value="Azulado">Azulado</option>
                           <option value="Rojo/Sangre">Rojo/Sangre ⚠️</option>
                           <option value="Verde/Pus">Verde/Pus ⚠️</option>
                         </select>
                       </td>
                       <td className="px-4 py-3 text-center">
                         <input 
                           type="checkbox" 
                           className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500"
                           checked={jar.analysisData?.physical?.offFlavor || false}
                           onChange={(e) => handlePhysicalChange(jar.id, 'offFlavor', e.target.checked)}
                         />
                       </td>
                       <td className="px-4 py-3">
                         <input 
                           type="text" 
                           placeholder="Describir si hay suciedad..."
                           className="border border-slate-300 rounded p-1.5 text-sm w-full"
                           value={jar.analysisData?.physical?.contamination || ''}
                           onChange={(e) => handlePhysicalChange(jar.id, 'contamination', e.target.value)}
                         />
                       </td>
                       <td className="px-4 py-3 text-right">
                         {jar.status === MilkStatus.DISCARDED ? (
                           <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                             <X size={12}/> Rechazado
                           </span>
                         ) : (
                           <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                             <CheckCircle2 size={12}/> Apto
                           </span>
                         )}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* STEP 2: CHEMICAL ANALYSIS */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex gap-4 mb-6">
               <div className="flex-1 bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                 <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Calculator size={20}/></div>
                 <div>
                   <p className="text-xs text-slate-500 font-bold uppercase">Rango Acidez Permitido</p>
                   <p className="text-lg font-bold text-slate-800">1.0 - 8.0 °D</p>
                 </div>
               </div>
               <div className="flex-1 bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
                 <div className="p-2 bg-pink-100 text-pink-600 rounded-lg"><Activity size={20}/></div>
                 <div>
                   <p className="text-xs text-slate-500 font-bold uppercase">Crematocrito (Kcal/L)</p>
                   <p className="text-sm font-medium text-slate-700">Normocalórica: 500-700</p>
                 </div>
               </div>
             </div>

             <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                   <tr>
                     <th className="px-4 py-3">Frasco</th>
                     <th className="px-4 py-3 w-48 text-center">Acidez Dornic (3 Alícuotas)</th>
                     <th className="px-4 py-3 text-center">Promedio</th>
                     <th className="px-4 py-3 w-32">Kcal/L</th>
                     <th className="px-4 py-3">Clasificación</th>
                     <th className="px-4 py-3 text-right">Estado</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {analyzedJars.map((jar) => {
                     // Skip physically rejected jars in UI but keep them in state
                     if (jar.analysisData?.physical?.contamination || jar.analysisData?.physical?.color.includes('⚠️')) return null;

                     const chem = jar.analysisData?.chemical;
                     const avg = chem?.acidityAverage || 0;
                     const isHighAcidity = avg > 8;

                     return (
                      <tr key={jar.id} className="hover:bg-slate-50">
                       <td className="px-4 py-3 font-medium text-slate-800">
                         {jar.folio}
                         <div className="text-xs text-slate-400 font-normal">{jar.volumeMl}mL • {jar.milkType}</div>
                       </td>
                       <td className="px-4 py-3">
                         <div className="flex gap-1 justify-center">
                           {[0, 1, 2].map(idx => (
                             <input 
                               key={idx}
                               type="number"
                               step="0.1"
                               className="w-12 p-1 text-center border border-slate-300 rounded text-sm focus:ring-2 focus:ring-pink-500"
                               value={chem?.acidityAliquots[idx] || ''}
                               onChange={(e) => handleChemicalChange(jar.id, 'acidity', e.target.value, idx)}
                             />
                           ))}
                         </div>
                       </td>
                       <td className="px-4 py-3 text-center font-bold text-slate-700">
                         {avg > 0 ? `${avg}°D` : '-'}
                       </td>
                       <td className="px-4 py-3">
                         <input 
                           type="number" 
                           className="w-full p-1.5 border border-slate-300 rounded text-sm"
                           placeholder="Ej: 650"
                           value={chem?.creamatocrit || ''}
                           onChange={(e) => handleChemicalChange(jar.id, 'creamatocrit', e.target.value)}
                         />
                       </td>
                       <td className="px-4 py-3">
                          {chem?.classification && (
                             <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border
                               ${chem.classification === CaloricClassification.NORMOCALORIC ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                 chem.classification === CaloricClassification.HYPOCALORIC ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-blue-50 text-blue-700 border-blue-100'}
                             `}>
                               {chem.classification}
                             </span>
                          )}
                       </td>
                       <td className="px-4 py-3 text-right">
                         {isHighAcidity ? (
                           <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded" title="Acidez > 8°D">
                             <X size={12}/> Rechazar
                           </span>
                         ) : (
                           <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                             <CheckCircle2 size={12}/> Aprobado
                           </span>
                         )}
                       </td>
                     </tr>
                   )})}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {/* STEP 3: SUMMARY */}
        {step === 3 && (
          <div className="animate-in fade-in zoom-in duration-300 max-w-2xl mx-auto text-center pt-8">
             <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Resumen de Análisis</h3>
                <p className="text-slate-500 mb-8">Revise los resultados antes de finalizar el lote.</p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <span className="block text-3xl font-bold text-slate-800">{stats.total}</span>
                    <span className="text-xs uppercase font-bold text-slate-400">Total Frascos</span>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl">
                    <span className="block text-3xl font-bold text-emerald-600">{stats.passed}</span>
                    <span className="text-xs uppercase font-bold text-emerald-700">Aprobados</span>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl">
                    <span className="block text-3xl font-bold text-red-600">{stats.rejected}</span>
                    <span className="text-xs uppercase font-bold text-red-700">Rechazados</span>
                  </div>
                </div>

                {stats.rejected > 0 && (
                   <div className="bg-red-50 border border-red-100 p-4 rounded-lg text-left text-sm text-red-800 flex items-start gap-3">
                      <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="font-bold">Acción Requerida:</p>
                        <p>Los {stats.rejected} frascos rechazados serán marcados como "Descartados" y eliminados del inventario activo automáticamente.</p>
                      </div>
                   </div>
                )}
             </div>
          </div>
        )}

      </div>

      {/* FOOTER ACTIONS */}
      <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center">
        <button 
          onClick={onCancel}
          className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
        >
          Cancelar
        </button>
        
        <div className="flex gap-3">
          {step > 1 && (
             <button 
               onClick={() => setStep(p => p - 1)}
               className="px-6 py-2 text-slate-600 font-medium border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-2"
             >
               <ArrowLeft size={16}/> Anterior
             </button>
          )}

          {step < 3 ? (
             <button 
               onClick={() => setStep(p => p + 1)}
               className="px-6 py-2 bg-slate-800 text-white font-medium hover:bg-slate-700 rounded-lg shadow-sm flex items-center gap-2"
             >
               Siguiente <ArrowRight size={16}/>
             </button>
          ) : (
             <button 
               onClick={() => onComplete(analyzedJars)}
               className="px-8 py-2 bg-emerald-600 text-white font-bold hover:bg-emerald-700 rounded-lg shadow-md flex items-center gap-2"
             >
               <Save size={18}/> Finalizar y Guardar
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalysisWizard;