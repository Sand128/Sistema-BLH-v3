/**
 * MÓDULO: Almacén e Inventario (Inventory)
 * 
 * PROPÓSITO:
 * Gestionar la visualización y el control del ciclo de vida de la leche (Frascos y Lotes)
 * dentro del Banco de Leche. Este módulo implementa reglas de negocio críticas para
 * la seguridad alimentaria, específicamente el sistema PEPS (Primeras Entradas, Primeras Salidas).
 * 
 * FUNCIONALIDADES CLAVE:
 * 1. Visualización segregada por estado (Cruda, Cuarentena, Liberada).
 * 2. Cálculo automático de caducidad.
 * 3. Ordenamiento visual basado en riesgos (PEPS).
 * 4. Sistema de alertas proactivas para lotes próximos a vencer.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { MilkStatus, MilkBatch, MilkJar, MilkType, StorageUnit } from '../types';
import { 
  Package, Thermometer, AlertTriangle, Snowflake, 
  Search, Filter, Droplet, ArrowRight, Clock, 
  FlaskConical, CheckCircle2, AlertCircle, Calendar
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

// --- HELPER FUNCTIONS ---

/**
 * Calcula los días restantes hasta la fecha de caducidad.
 * 
 * @param dateStr - Fecha de caducidad en formato string ISO (YYYY-MM-DD)
 * @returns Número entero de días. Negativo si ya venció. 999 si no hay fecha.
 */
const getDaysRemaining = (dateStr?: string) => {
  if (!dateStr) return 999;
  const exp = new Date(dateStr);
  const now = new Date();
  const diffTime = exp.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};

/**
 * Determina el estilo visual y etiqueta de prioridad basado en días restantes.
 * Implementa la lógica visual del semáforo PEPS.
 * 
 * @param days - Días restantes para caducidad
 * @returns Objeto con etiqueta, clase CSS de color e icono.
 */
const getPepsBadge = (days: number) => {
  if (days < 0) return { label: 'VENCIDO', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle };
  if (days <= 7) return { label: 'PRIORIDAD CRÍTICA', color: 'bg-red-50 text-red-700 border-red-200', icon: AlertTriangle };
  if (days <= 30) return { label: 'PRIORIDAD ALTA', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: Clock };
  return { label: 'NORMAL', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
};

const Inventory: React.FC = () => {
  const { addNotification, notifications } = useNotifications();
  // Estado para controlar la pestaña activa (Filtro principal)
  const [activeTab, setActiveTab] = useState<'RAW' | 'QUARANTINE' | 'RELEASED'>('RELEASED');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. CARGA DE DATOS (Data Source)
  // Se utiliza localStorage como persistencia simulada.
  // En producción, esto sería una llamada API (React Query / SWR).
  const jars: MilkJar[] = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('app_jars') || '[]');
    } catch (e) { return []; }
  }, []);

  const batches: MilkBatch[] = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('app_batches') || '[]');
    } catch (e) { return []; }
  }, []);

  // 2. LÓGICA DE FILTRADO Y ORDENAMIENTO (PEPS Engine)
  
  // A. Leche Cruda (Materia Prima)
  // Estrategia: Ordenar por Fecha de Extracción (Ascendente).
  // Objetivo: Pasteurizar primero lo que se extrajo hace más tiempo.
  const rawInventory = useMemo(() => {
    return jars
      .filter(j => j.status === MilkStatus.RAW)
      .sort((a, b) => new Date(a.extractionDate).getTime() - new Date(b.extractionDate).getTime());
  }, [jars]);

  // B. En Cuarentena (Work In Progress)
  // Estrategia: Ordenar por Fecha de Creación del Lote.
  // Objetivo: Liberar resultados microbiológicos en orden de llegada.
  const quarantineInventory = useMemo(() => {
    return batches
      .filter(b => b.status === MilkStatus.QUARANTINE)
      .sort((a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime());
  }, [batches]);

  // C. Leche Liberada (Producto Terminado)
  // Estrategia: Ordenar por Fecha de Caducidad (PEPS estricto).
  // Objetivo: Asegurar que se consuma primero lo que vence antes.
  const releasedInventory = useMemo(() => {
    return batches
      .filter(b => b.status === MilkStatus.RELEASED && b.volumeTotalMl > 0) // Ocultar vacíos
      .sort((a, b) => {
        const dateA = new Date(a.expirationDate || '9999-12-31').getTime();
        const dateB = new Date(b.expirationDate || '9999-12-31').getTime();
        return dateA - dateB; // Ascendente: Vencimiento más próximo primero
      });
  }, [batches]);

  // --- SISTEMA DE ALERTAS PROACTIVAS ---
  // Efecto secundario: Analiza el inventario liberado y genera notificaciones
  // si detecta lotes próximos a vencer.
  useEffect(() => {
    releasedInventory.forEach(batch => {
      const days = getDaysRemaining(batch.expirationDate);
      let alertMessage = '';
      let alertType: 'warning' | 'error' | 'info' = 'info';
      
      // Umbrales de alerta: 1 día, 3 días, 7 días
      if (days <= 1 && days >= 0) {
        alertMessage = `URGENTE: Lote ${batch.folio} vence en menos de 24h. Priorizar uso.`;
        alertType = 'error';
      } else if (days <= 3 && days > 1) {
        alertMessage = `ALERTA: Lote ${batch.folio} vence en 3 días.`;
        alertType = 'warning';
      } else if (days <= 7 && days > 3) {
        alertMessage = `PREVENTIVA: Lote ${batch.folio} vence en 1 semana.`;
        alertType = 'info';
      }

      // Evitar notificaciones duplicadas (Debouncing lógico)
      if (alertMessage) {
        const alreadyNotified = notifications.some(n => n.title === alertMessage);
        if (!alreadyNotified) {
          addNotification(alertMessage, alertType, 'inventory');
        }
      }
    });
  }, [releasedInventory, addNotification, notifications]);

  // 3. Cálculo de Estadísticas (KPIs Rápidos)
  const stats = {
    rawVol: rawInventory.reduce((acc, i) => acc + i.volumeMl, 0),
    quarantineVol: quarantineInventory.reduce((acc, i) => acc + i.volumeTotalMl, 0),
    releasedVol: releasedInventory.reduce((acc, i) => acc + i.volumeTotalMl, 0),
  };

  // 4. Filtrado de Búsqueda (Se aplica sobre la vista actual)
  const filterList = (list: any[]) => {
    return list.filter(item => {
      const searchStr = searchTerm.toLowerCase();
      const folio = (item.folio || '').toLowerCase();
      const type = (item.milkType || '').toLowerCase();
      return folio.includes(searchStr) || type.includes(searchStr);
    });
  };

  const currentList = activeTab === 'RAW' ? filterList(rawInventory) 
                    : activeTab === 'QUARANTINE' ? filterList(quarantineInventory)
                    : filterList(releasedInventory);

  return (
    <div className="space-y-6 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Package className="text-blue-600"/> Almacén General
          </h2>
          <p className="text-slate-500 mt-1 text-sm">Gestión de inventario, ubicaciones y control de caducidad (PEPS).</p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-2 text-xs">
           <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
             <span className="block font-bold opacity-70">CRUDA</span>
             <span className="font-mono text-base font-bold">{(stats.rawVol/1000).toFixed(1)}L</span>
           </div>
           <div className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
             <span className="block font-bold opacity-70">CUARENTENA</span>
             <span className="font-mono text-base font-bold">{(stats.quarantineVol/1000).toFixed(1)}L</span>
           </div>
           <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
             <span className="block font-bold opacity-70">LIBERADA</span>
             <span className="font-mono text-base font-bold">{(stats.releasedVol/1000).toFixed(1)}L</span>
           </div>
        </div>
      </div>

      {/* TABS & FILTERS */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center bg-slate-50/50 p-2 gap-4">
           
           {/* Custom Tab Switcher */}
           <div className="flex bg-slate-200/50 p-1 rounded-lg w-full sm:w-auto">
              <button 
                onClick={() => setActiveTab('RAW')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'RAW' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Droplet size={14}/> Mat. Prima
              </button>
              <button 
                onClick={() => setActiveTab('QUARANTINE')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'QUARANTINE' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <FlaskConical size={14}/> Cuarentena
              </button>
              <button 
                onClick={() => setActiveTab('RELEASED')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'RELEASED' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <CheckCircle2 size={14}/> Liberada
              </button>
           </div>

           {/* Search */}
           <div className="relative w-full sm:w-64 mr-2">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text" 
               placeholder="Buscar lote o tipo..." 
               className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="min-h-[400px]">
          
          {/* VIEW 1: RAW INVENTORY (FRASCOS) */}
          {activeTab === 'RAW' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3">Prioridad (PEPS)</th>
                    <th className="px-6 py-3">Folio Frasco</th>
                    <th className="px-6 py-3">Donadora</th>
                    <th className="px-6 py-3">Tipo Leche</th>
                    <th className="px-6 py-3">Volumen</th>
                    <th className="px-6 py-3 text-right">Ubicación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentList.map((jar: any, idx) => (
                    <tr key={jar.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx === 0 ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-200' : 'bg-slate-100 text-slate-500'}`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-medium text-slate-700">{jar.folio}</td>
                      <td className="px-6 py-4 text-slate-600">{jar.donorName}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100 font-medium">
                          {jar.milkType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">{jar.volumeMl} mL</td>
                      <td className="px-6 py-4 text-right text-slate-500">
                        {jar.location || 'Recepción'}
                      </td>
                    </tr>
                  ))}
                  {currentList.length === 0 && (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-400">No hay leche cruda en inventario.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW 2: QUARANTINE INVENTORY (LOTES) */}
          {activeTab === 'QUARANTINE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-slate-50/30">
               {currentList.map((batch: any) => (
                 <div key={batch.id} className="bg-white rounded-xl border border-amber-200 shadow-sm p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-mono text-sm font-bold text-amber-900 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                          {batch.folio}
                        </span>
                        <FlaskConical size={16} className="text-amber-400"/>
                      </div>
                      
                      <div className="space-y-2 mt-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Volumen:</span>
                          <span className="font-bold text-slate-800">{batch.volumeTotalMl} mL</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Tipo:</span>
                          <span className="text-slate-700">{batch.type} ({batch.milkType})</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Creación:</span>
                          <span className="text-slate-700">{new Date(batch.creationDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">
                          <Clock size={12}/> Esperando Cultivo Microbiológico
                        </div>
                      </div>
                    </div>
                 </div>
               ))}
               {currentList.length === 0 && (
                 <div className="col-span-full p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                   No hay lotes en cuarentena.
                 </div>
               )}
            </div>
          )}

          {/* VIEW 3: RELEASED INVENTORY (PEPS) */}
          {activeTab === 'RELEASED' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-emerald-50/50 text-emerald-900 font-semibold border-b border-emerald-100">
                  <tr>
                    <th className="px-6 py-4">Estado PEPS</th>
                    <th className="px-6 py-4">Lote</th>
                    <th className="px-6 py-4">Caducidad</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Volumen Disp.</th>
                    <th className="px-6 py-4 text-right">Ubicación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentList.map((batch: any) => {
                    const days = getDaysRemaining(batch.expirationDate);
                    const badge = getPepsBadge(days);
                    const BadgeIcon = badge.icon;

                    return (
                      <tr key={batch.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold border ${badge.color}`}>
                            <BadgeIcon size={12}/> {badge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-700">
                          {batch.folio}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(batch.expirationDate).toLocaleDateString()}
                          <span className="block text-xs text-slate-400 mt-0.5">{days} días restantes</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-800">{batch.milkType}</span>
                          <span className="block text-xs text-slate-500">{batch.type}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-700 text-lg">
                          {batch.volumeTotalMl} mL
                        </td>
                        <td className="px-6 py-4 text-right text-slate-500 text-xs">
                          {batch.location 
                            ? `${batch.location.equipmentId} | ${batch.location.position}` 
                            : <span className="italic text-slate-400">Sin asignar</span>}
                        </td>
                      </tr>
                    );
                  })}
                  {currentList.length === 0 && (
                    <tr><td colSpan={6} className="p-12 text-center text-slate-400">No hay leche liberada disponible.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
        
        {/* Footer Info */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
           <span>Mostrando {currentList.length} registros</span>
           <span className="flex items-center gap-1"><Calendar size={12}/> Sistema PEPS Activo</span>
        </div>
      </div>
    </div>
  );
};

export default Inventory;