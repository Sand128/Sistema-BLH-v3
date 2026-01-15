import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, Save, X, AlertTriangle, FlaskConical, Milk, CheckCircle2, Clock, ListOrdered
} from 'lucide-react';
import { MilkJar, MilkStatus, MilkBatch, MilkType, DonorType } from '../types';

interface BatchWizardProps {
  availableJars: MilkJar[];
  onComplete: (batch: MilkBatch) => void;
  onCancel: () => void;
}

const BatchWizard: React.FC<BatchWizardProps> = ({ availableJars, onComplete, onCancel }) => {
  // Only 1 step now: Selection/Pooling
  const [selectedJars, setSelectedJars] = useState<MilkJar[]>([]);
  const [filterType, setFilterType] = useState<MilkType>(MilkType.MATURE);
  const [pepsError, setPepsError] = useState<string | null>(null);
  
  // VALIDATION LOGIC
  const uniqueDonors: string[] = Array.from(new Set(selectedJars.map(j => j.donorId)));
  const totalVolume = selectedJars.reduce((acc, j) => acc + j.volumeMl, 0);
  const isDonorLimitExceeded = uniqueDonors.length > 3;

  // PEPS: Sort Jars by Extraction Date + Time (Oldest First)
  const sortedJars = useMemo(() => {
    return availableJars
      .filter(j => j.milkType === filterType)
      .sort((a, b) => {
        const dateA = new Date(`${a.extractionDate}T${a.extractionTime}`);
        const dateB = new Date(`${b.extractionDate}T${b.extractionTime}`);
        return dateA.getTime() - dateB.getTime();
      });
  }, [availableJars, filterType]);

  const toggleJar = (jar: MilkJar) => {
    setPepsError(null);
    const jarDate = new Date(`${jar.extractionDate}T${jar.extractionTime}`).getTime();
    
    // Check if currently selected
    const isSelected = selectedJars.find(j => j.id === jar.id);

    if (isSelected) {
      // LOGIC: Deselection
      // Can only deselect if it's the newest selected jar (LIFO removal to maintain FIFO block)
      // OR stricter: Check if any NEWER jar is selected. If so, cannot deselect this one.
      const newerSelected = selectedJars.filter(j => {
        const jDate = new Date(`${j.extractionDate}T${j.extractionTime}`).getTime();
        return jDate > jarDate;
      });

      if (newerSelected.length > 0) {
        setPepsError("Infracción PEPS: No puede deseleccionar un frasco antiguo si mantiene seleccionados frascos más recientes. Deseleccione los más nuevos primero.");
        return;
      }

      setSelectedJars(prev => prev.filter(j => j.id !== jar.id));
    } else {
      // LOGIC: Selection
      // Can only select if all OLDER jars are already selected
      const olderUnselected = sortedJars.filter(j => {
        const jDate = new Date(`${j.extractionDate}T${j.extractionTime}`).getTime();
        const isAlreadySelected = selectedJars.find(s => s.id === j.id);
        return jDate < jarDate && !isAlreadySelected;
      });

      if (olderUnselected.length > 0) {
        setPepsError(`Infracción PEPS: Existen ${olderUnselected.length} frascos con fecha anterior. Debe seleccionar los frascos más antiguos primero.`);
        return;
      }

      if (jar.milkType !== filterType && selectedJars.length > 0) {
        alert("No se pueden mezclar tipos de leche diferentes.");
        return;
      }
      setSelectedJars(prev => [...prev, jar]);
    }
  };

  const handleFinish = () => {
    const isHeterologous = selectedJars.some(j => j.donorType === DonorType.HETEROLOGOUS);
    const today = new Date();
    
    // Default expiration (will be refined in Analysis)
    const expDate = new Date(today);
    expDate.setMonth(today.getMonth() + 6);

    const newBatch: MilkBatch = {
      id: Math.random().toString(36).substr(2, 9),
      folio: `LP-${today.toISOString().split('T')[0]}-${Math.floor(Math.random() * 100)}`,
      donors: uniqueDonors.map(id => ({ id, name: selectedJars.find(j => j.donorId === id)?.donorName || '?' })),
      jarIds: selectedJars.map(j => j.id),
      type: isHeterologous ? 'Heteróloga' : 'Homóloga',
      milkType: filterType,
      volumeTotalMl: totalVolume,
      status: MilkStatus.RAW, // Starts as RAW, waiting for Analysis module
      creationDate: today.toISOString(),
      expirationDate: expDate.toISOString(),
      pasteurization: {
        date: '',
        tempCurve: [],
        responsible: '',
        completed: false
      }
    };
    onComplete(newBatch);
  };

  // Helper to get priority index
  const getPepsIndex = (jarId: string) => {
    return sortedJars.findIndex(j => j.id === jarId) + 1;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FlaskConical className="text-orange-500" />
            Creación de Lote (Pooling)
          </h2>
          <p className="text-xs text-slate-500">Seleccione los frascos siguiendo orden PEPS.</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        <div className="animate-in fade-in slide-in-from-right-4">
           <div className="flex flex-col md:flex-row gap-6 mb-6">
              {/* Filters & Stats */}
              <div className="w-full md:w-1/3 space-y-4">
                 <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-0">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipo de Leche</label>
                    <select 
                      className="w-full p-2 border border-slate-300 rounded-lg mb-4"
                      value={filterType}
                      onChange={(e) => {
                        setFilterType(e.target.value as MilkType);
                        setSelectedJars([]); 
                        setPepsError(null);
                      }}
                    >
                      {Object.values(MilkType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div className="flex justify-between text-sm">
                         <span className="text-slate-600">Frascos:</span>
                         <span className="font-bold">{selectedJars.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                         <span className="text-slate-600">Volumen Total:</span>
                         <span className="font-bold text-blue-600">{totalVolume} mL</span>
                      </div>
                      <div className="flex justify-between text-sm">
                         <span className="text-slate-600">Donantes (Max 3):</span>
                         <span className={`font-bold ${isDonorLimitExceeded ? 'text-red-600' : 'text-emerald-600'}`}>
                           {uniqueDonors.length} / 3
                         </span>
                      </div>
                    </div>

                    {isDonorLimitExceeded && (
                      <div className="mt-4 p-2 bg-red-50 text-red-700 text-xs rounded border border-red-100 flex gap-2">
                         <AlertTriangle size={14}/> Límite de donantes excedido.
                      </div>
                    )}

                    {pepsError && (
                      <div className="mt-4 p-3 bg-orange-50 text-orange-800 text-xs rounded-lg border border-orange-200 flex gap-2 animate-in slide-in-from-top-2">
                         <ListOrdered size={32} className="flex-shrink-0 mt-0.5"/> 
                         <span>{pepsError}</span>
                      </div>
                    )}
                 </div>
              </div>

              {/* Jar Grid */}
              <div className="w-full md:w-2/3">
                 <div className="flex justify-between items-center mb-3">
                   <h3 className="font-bold text-slate-700 flex items-center gap-2">
                     <Milk size={16} /> Frascos Disponibles: {filterType}
                   </h3>
                   <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 flex items-center gap-1">
                     <ListOrdered size={12}/> Ordenados por antigüedad (PEPS)
                   </span>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {sortedJars.map((jar, index) => {
                      const isSelected = selectedJars.some(j => j.id === jar.id);
                      const pepsPriority = index + 1;
                      
                      // Highlight the next expected item if not selected
                      const isNextToSelect = !isSelected && sortedJars.slice(0, index).every(j => selectedJars.some(s => s.id === j.id));

                      return (
                        <div 
                          key={jar.id}
                          onClick={() => toggleJar(jar)}
                          className={`relative p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected 
                              ? 'bg-orange-50 border-orange-500 shadow-sm ring-1 ring-orange-500' 
                              : isNextToSelect
                                ? 'bg-white border-blue-300 ring-2 ring-blue-100 hover:border-orange-300'
                                : 'bg-slate-50 border-slate-200 opacity-70 hover:opacity-100 hover:bg-white'
                          }`}
                        >
                           {/* PEPS Badge */}
                           <div className={`absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm z-10 
                             ${isSelected ? 'bg-orange-500 text-white' : isNextToSelect ? 'bg-blue-500 text-white animate-bounce' : 'bg-slate-200 text-slate-500'}`}>
                             {pepsPriority}
                           </div>

                           <div className="flex justify-between items-start mb-1 pl-3">
                              <span className="font-mono text-xs font-bold text-slate-600">{jar.folio}</span>
                              {isSelected && <CheckCircle2 size={16} className="text-orange-600"/>}
                           </div>
                           <div className="text-sm font-medium text-slate-800 pl-3">{jar.donorName}</div>
                           <div className="flex justify-between mt-2 text-xs text-slate-500 pl-3">
                             <span className="font-bold text-slate-700">{jar.volumeMl} mL</span>
                             <span className="flex items-center gap-1">
                               <Clock size={10}/> {jar.extractionDate} {jar.extractionTime}
                             </span>
                           </div>
                        </div>
                      );
                    })}
                    {sortedJars.length === 0 && (
                      <div className="col-span-2 text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                        No hay frascos aprobados disponibles de este tipo.
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3">
        <button onClick={onCancel} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">
          Cancelar
        </button>
        
        <button 
          onClick={handleFinish}
          disabled={selectedJars.length === 0 || isDonorLimitExceeded}
          className="px-8 py-2 bg-slate-800 text-white font-bold hover:bg-slate-700 rounded-lg shadow-md disabled:opacity-50 disabled:bg-slate-300 flex items-center gap-2"
        >
          <Save size={18} /> Guardar Lote
        </button>
      </div>
    </div>
  );
};

export default BatchWizard;