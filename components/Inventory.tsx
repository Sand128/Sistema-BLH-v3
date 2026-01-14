import React, { useState } from 'react';
import { MilkStatus, MilkBatch, MilkType, StorageUnit } from '../types';
import { 
  Beaker, Thermometer, Archive, AlertTriangle, Snowflake, 
  Map, List, Search, Filter, Droplet, ArrowRight, Trash2, Box
} from 'lucide-react';
import { MoveModal, DiscardModal } from './InventoryModals';

// --- MOCK DATA ---
const MOCK_STORAGE_UNITS: StorageUnit[] = [
  { id: 'CONG-A', name: 'Congelador A', type: 'Freezer', temperature: -18.5, status: 'OK', capacity: 100, used: 45, shelves: 4 },
  { id: 'CONG-B', name: 'Congelador B', type: 'Freezer', temperature: -15.2, status: 'WARNING', capacity: 100, used: 30, shelves: 4 },
  { id: 'REF-01', name: 'Refrigerador 1', type: 'Refrigerator', temperature: 4.0, status: 'OK', capacity: 50, used: 12, shelves: 3 },
];

const MOCK_INVENTORY: MilkBatch[] = [
  { 
    id: '1', folio: 'LP-2024-05-01', type: 'Heteróloga', milkType: MilkType.COLOSTRUM, volumeTotalMl: 150,
    status: MilkStatus.RELEASED, creationDate: '2024-05-20', expirationDate: '2024-05-30', // Expiring soon
    donors: [{id:'1', name:'Maria'}], jarIds: ['1'],
    location: { equipmentId: 'CONG-A', shelf: 1, position: 'A1' }
  },
  { 
    id: '2', folio: 'LP-2024-05-02', type: 'Heteróloga', milkType: MilkType.MATURE, volumeTotalMl: 200,
    status: MilkStatus.RELEASED, creationDate: '2024-05-21', expirationDate: '2024-11-21',
    donors: [{id:'2', name:'Ana'}], jarIds: ['2'],
    location: { equipmentId: 'CONG-A', shelf: 2, position: 'B3' }
  },
  { 
    id: '3', folio: 'HO-2024-05-15', type: 'Homóloga', milkType: MilkType.TRANSITION, volumeTotalMl: 50,
    status: MilkStatus.RAW, creationDate: '2024-05-27', expirationDate: '2024-06-11',
    donors: [{id:'1', name:'Maria'}], jarIds: ['3'],
    location: { equipmentId: 'REF-01', shelf: 1, position: 'R1' }
  },
  { 
    id: '4', folio: 'LP-2024-04-30', type: 'Heteróloga', milkType: MilkType.MATURE, volumeTotalMl: 300,
    status: MilkStatus.RELEASED, creationDate: '2024-04-30', expirationDate: '2024-05-28', // Expiring VERY soon
    donors: [{id:'3', name:'Rosa'}], jarIds: ['4'],
    location: { equipmentId: 'CONG-B', shelf: 1, position: 'C2' }
  }
];

// --- HELPER FUNCTIONS ---
const getDaysRemaining = (dateStr?: string) => {
  if (!dateStr) return 999;
  const exp = new Date(dateStr);
  const now = new Date();
  const diffTime = exp.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

const getPriorityBadge = (days: number) => {
  if (days <= 3) return { label: 'CRÍTICO', color: 'bg-red-600 text-white', icon: '🚨' };
  if (days <= 7) return { label: 'ALTA', color: 'bg-orange-500 text-white', icon: '⚠️' };
  if (days <= 30) return { label: 'MEDIA', color: 'bg-blue-500 text-white', icon: 'ℹ️' };
  return { label: 'BAJA', color: 'bg-slate-200 text-slate-600', icon: '' };
};

// --- MAIN COMPONENT ---
const Inventory: React.FC = () => {
  const [view, setView] = useState<'PEPS' | 'MAP'>('PEPS');
  const [inventory, setInventory] = useState<MilkBatch[]>(MOCK_INVENTORY);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [moveItem, setMoveItem] = useState<MilkBatch | null>(null);
  const [discardItem, setDiscardItem] = useState<MilkBatch | null>(null);

  // Sorting for PEPS (First Expiring First)
  const sortedInventory = [...inventory].sort((a, b) => {
    const dateA = new Date(a.expirationDate || '9999-12-31').getTime();
    const dateB = new Date(b.expirationDate || '9999-12-31').getTime();
    return dateA - dateB;
  });

  const filteredInventory = sortedInventory.filter(item => 
    item.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Action Handlers
  const handleMoveConfirm = (itemId: string, loc: { equipmentId: string, shelf: number, position: string }) => {
    setInventory(prev => prev.map(item => 
      item.id === itemId ? { ...item, location: loc } : item
    ));
    setMoveItem(null);
  };

  const handleDiscardConfirm = (itemId: string, reason: string) => {
    setInventory(prev => prev.filter(item => item.id !== itemId)); // Remove for demo
    setDiscardItem(null);
    alert(`Lote descartado: ${reason}`);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & ALERTS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inventario y Almacenamiento</h2>
          <p className="text-slate-500">Gestión de Stock, PEPS y Cadena de Frío</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-white rounded-lg border border-slate-200 p-1 shadow-sm">
          <button 
            onClick={() => setView('PEPS')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
              view === 'PEPS' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <List size={16} /> Listado PEPS
          </button>
          <button 
            onClick={() => setView('MAP')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
              view === 'MAP' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Map size={16} /> Mapa de Frío
          </button>
        </div>
      </div>

      {/* EQUIPMENT STATUS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_STORAGE_UNITS.map(unit => (
          <div key={unit.id} className={`p-4 rounded-xl border flex items-center justify-between shadow-sm ${
            unit.status === 'WARNING' ? 'bg-orange-50 border-orange-200' : 
            unit.status === 'CRITICAL' ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'
          }`}>
             <div>
               <p className="text-xs font-bold uppercase opacity-60 flex items-center gap-1">
                 {unit.type === 'Freezer' ? <Snowflake size={12}/> : <Droplet size={12}/>} 
                 {unit.name}
               </p>
               <div className="flex items-baseline gap-2 mt-1">
                 <span className={`text-2xl font-bold ${
                    unit.status !== 'OK' ? 'text-orange-600' : 'text-slate-800'
                 }`}>{unit.temperature}°C</span>
                 <span className="text-xs text-slate-500">{unit.used}/{unit.capacity} Ocupados</span>
               </div>
             </div>
             {unit.status !== 'OK' && (
               <AlertTriangle className="text-orange-500" size={24} />
             )}
          </div>
        ))}
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex gap-3">
           <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar lote, tipo o folio..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
           </div>
           <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2">
             <Filter size={18} /> Filtros
           </button>
        </div>

        {/* --- VIEW: PEPS LIST --- */}
        {view === 'PEPS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-medium text-sm">
                <tr>
                  <th className="px-6 py-4">Prioridad</th>
                  <th className="px-6 py-4">Folio</th>
                  <th className="px-6 py-4">Tipo</th>
                  <th className="px-6 py-4">Caducidad</th>
                  <th className="px-6 py-4">Ubicación</th>
                  <th className="px-6 py-4">Volumen</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredInventory.map((item, index) => {
                  const days = getDaysRemaining(item.expirationDate);
                  const badge = getPriorityBadge(days);
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 group">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold ${badge.color}`}>
                          {badge.icon} {badge.label}
                        </span>
                        {index === 0 && days > 0 && <span className="ml-2 text-xs text-emerald-600 font-bold">★ Siguiente Salida</span>}
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-slate-700">{item.folio}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span>{item.type}</span>
                          <span className="text-xs text-slate-400">{item.milkType}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">
                          {new Date(item.expirationDate!).toLocaleDateString()}
                        </div>
                        <div className={`text-xs ${days <= 7 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                          {days < 0 ? 'VENCIDO' : `${days} días restantes`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         {item.location ? (
                           <div className="flex items-center gap-1 text-slate-600">
                             <Box size={14} />
                             {item.location.equipmentId} <span className="text-slate-300">|</span> {item.location.position}
                           </div>
                         ) : <span className="text-slate-400 italic">Sin asignar</span>}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-600">{item.volumeTotalMl} mL</td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                             onClick={() => setMoveItem(item)}
                             className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg" 
                             title="Mover"
                           >
                             <ArrowRight size={18} />
                           </button>
                           <button 
                             onClick={() => setDiscardItem(item)}
                             className="p-2 hover:bg-red-50 text-red-600 rounded-lg" 
                             title="Desechar"
                           >
                             <Trash2 size={18} />
                           </button>
                         </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* --- VIEW: STORAGE MAP --- */}
        {view === 'MAP' && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
             {MOCK_STORAGE_UNITS.map(unit => (
               <div key={unit.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 p-3 border-b border-slate-200 flex justify-between items-center">
                    <span className="font-bold text-slate-700">{unit.name}</span>
                    <span className="text-xs text-slate-500">Capacidad: {Math.round((unit.used/unit.capacity)*100)}%</span>
                  </div>
                  <div className="p-4 grid grid-cols-5 gap-2 bg-slate-100/50 min-h-[200px]">
                     {/* Simulating slots */}
                     {Array.from({length: 20}).map((_, i) => {
                       // Find if slot is occupied in mock data (simplified logic)
                       const occupant = inventory.find(item => item.location?.equipmentId === unit.id && item.location?.position === `A${i+1}`);
                       
                       return (
                         <div 
                           key={i} 
                           className={`aspect-square rounded border flex items-center justify-center text-xs cursor-pointer transition-all ${
                             occupant 
                               ? 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200' 
                               : 'bg-white border-slate-200 text-slate-300 hover:border-slate-300'
                           }`}
                           onClick={() => occupant && setMoveItem(occupant)}
                           title={occupant ? `Lote: ${occupant.folio}` : 'Vacío'}
                         >
                           {occupant ? '📦' : `A${i+1}`}
                         </div>
                       );
                     })}
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>

      {/* MODALS */}
      {moveItem && (
        <MoveModal 
          item={moveItem} 
          units={MOCK_STORAGE_UNITS} 
          onConfirm={handleMoveConfirm} 
          onCancel={() => setMoveItem(null)} 
        />
      )}

      {discardItem && (
        <DiscardModal 
          item={discardItem} 
          onConfirm={handleDiscardConfirm} 
          onCancel={() => setDiscardItem(null)} 
        />
      )}

    </div>
  );
};

export default Inventory;