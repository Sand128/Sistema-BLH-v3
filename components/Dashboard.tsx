import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ArrowRight, 
  Beaker, 
  Bell, 
  Calendar, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  FileSearch, 
  FlaskConical, 
  Microscope, 
  Milk, 
  Plus, 
  Search, 
  Thermometer, 
  UserPlus 
} from 'lucide-react';
import { SystemAlert, ActivityLog } from '../types';

// --- MOCK DATA ---
const ALERTS: SystemAlert[] = [
  { id: '1', type: 'critical', message: 'Lote LP-2024-05-001 vence en 3 días', timestamp: 'Hace 2 horas', actionLabel: 'Gestionar' },
  { id: '2', type: 'warning', message: '2 frascos en análisis por más de 24h', timestamp: 'Hace 4 horas', actionLabel: 'Ver Análisis' },
  { id: '3', type: 'critical', message: 'Temp. Congelador A: -15°C (Fuera de rango)', timestamp: 'Hace 10 min', actionLabel: 'Revisar IoT' },
];

const ACTIVITY: ActivityLog[] = [
  { id: '1', user: 'Ana López', action: 'registró frasco', target: 'HO-2024-05-001', timestamp: '14:30', iconType: 'bottle' },
  { id: '2', user: 'Dr. Méndez', action: 'liberó lote', target: 'LP-2024-05-002', timestamp: '13:15', iconType: 'lab' },
  { id: '3', user: 'Enf. Ruiz', action: 'nueva donadora', target: 'María García (HO)', timestamp: '11:45', iconType: 'donor' },
  { id: '4', user: 'Ana López', action: 'administración', target: 'RN-024 (Cuna 4)', timestamp: '10:20', iconType: 'user' },
];

// --- SUB-COMPONENTS ---

const MetricCard = ({ title, value, unit, icon: Icon, color, subtext }: any) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
    <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
      <Icon size={64} />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
          <Icon size={18} className={color.replace('bg-', 'text-')} />
        </div>
        <span className="text-sm font-medium text-slate-500">{title}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        {unit && <span className="text-sm text-slate-500 font-medium">{unit}</span>}
      </div>
      {subtext && <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">{subtext}</p>}
    </div>
  </div>
);

const AlertItem = ({ alert }: { alert: SystemAlert }) => (
  <div className={`flex items-start gap-3 p-3 rounded-lg border ${
    alert.type === 'critical' ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'
  }`}>
    <AlertTriangle size={18} className={`mt-0.5 flex-shrink-0 ${
      alert.type === 'critical' ? 'text-red-600' : 'text-orange-600'
    }`} />
    <div className="flex-1">
      <p className={`text-sm font-medium ${
        alert.type === 'critical' ? 'text-red-800' : 'text-orange-800'
      }`}>{alert.message}</p>
      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs ${alert.type === 'critical' ? 'text-red-600' : 'text-orange-600'}`}>
          {alert.timestamp}
        </span>
        {alert.actionLabel && (
          <button className={`text-xs font-semibold hover:underline ${
            alert.type === 'critical' ? 'text-red-700' : 'text-orange-700'
          }`}>
            {alert.actionLabel}
          </button>
        )}
      </div>
    </div>
  </div>
);

const ActivityItem = ({ log }: { log: ActivityLog }) => {
  const getIcon = () => {
    switch (log.iconType) {
      case 'bottle': return Milk;
      case 'lab': return Microscope;
      case 'donor': return UserPlus;
      default: return CheckCircle2;
    }
  };
  const Icon = getIcon();

  return (
    <div className="flex gap-3 pb-6 last:pb-0 relative">
      <div className="absolute left-[15px] top-8 bottom-0 w-px bg-slate-200 last:hidden"></div>
      <div className="h-8 w-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 z-10">
        <Icon size={14} className="text-slate-500" />
      </div>
      <div className="flex-1 pt-1">
        <p className="text-sm text-slate-800">
          <span className="font-semibold">{log.user}</span> {log.action} <span className="font-medium text-pink-600">{log.target}</span>
        </p>
        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
          <Clock size={10} /> {log.timestamp}
        </p>
      </div>
    </div>
  );
};

const QuickActionButton = ({ icon: Icon, label, badge, onClick, colorClass }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:border-pink-300 hover:shadow-md transition-all group relative"
  >
    {badge > 0 && (
      <span className="absolute top-2 right-2 bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
        {badge}
      </span>
    )}
    <div className={`p-3 rounded-full mb-3 ${colorClass} group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <span className="text-xs font-semibold text-slate-700 text-center">{label}</span>
  </button>
);

// --- MAIN COMPONENT ---

const Dashboard: React.FC = () => {
  const [traceabilityId, setTraceabilityId] = useState('');

  const handleTraceabilitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Buscando trazabilidad para: ${traceabilityId}`);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      
      {/* 1. HEADER CONTEXT (Hospital + Traceability) */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-pink-700 tracking-wider">HOSPITAL ACTIVO</span>
             <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={10}/> Actualizado: hace 1 min</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Hospital General "Dr. Nicolás San Juan"</h2>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            <Calendar size={14} /> {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        
        <div className="w-full lg:w-auto">
          <label className="text-xs font-semibold text-slate-500 mb-1 block">Rastreo de Trazabilidad (Folio)</label>
          <form onSubmit={handleTraceabilitySearch} className="flex gap-2">
            <div className="relative flex-1 lg:w-80">
              <FileSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Ej: HO-2024-05-001" 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all text-sm font-mono"
                value={traceabilityId}
                onChange={(e) => setTraceabilityId(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors">
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* 2. KPIs REAL-TIME */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Leche Cruda" 
          value="24" 
          unit="Frascos" 
          subtext="Pendiente de Pasteurizar"
          icon={Milk} 
          color="bg-blue-500" 
        />
        <MetricCard 
          title="En Cuarentena" 
          value="3" 
          unit="Lotes" 
          subtext="Esperando cultivo"
          icon={FlaskConical} 
          color="bg-amber-500" 
        />
        <MetricCard 
          title="Leche Liberada" 
          value="156" 
          unit="Frascos" 
          subtext="Disponible para consumo"
          icon={CheckCircle2} 
          color="bg-emerald-500" 
        />
        <MetricCard 
          title="Alertas Críticas" 
          value="2" 
          subtext="Requieren atención inmediata"
          icon={Bell} 
          color="bg-rose-500" 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* 3. LEFT COLUMN: Quick Actions & Activity */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Quick Actions */}
          <section>
             <div className="flex items-center justify-between mb-3">
               <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Acceso Rápido</h3>
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               <QuickActionButton 
                 icon={UserPlus} 
                 label="Nueva Donadora" 
                 badge={0} 
                 colorClass="bg-pink-100 text-pink-600"
               />
               <QuickActionButton 
                 icon={Milk} 
                 label="Registrar Extracción" 
                 badge={0} 
                 colorClass="bg-blue-100 text-blue-600"
               />
               <QuickActionButton 
                 icon={Microscope} 
                 label="Análisis Pendientes" 
                 badge={5} 
                 colorClass="bg-purple-100 text-purple-600"
               />
               <QuickActionButton 
                 icon={Thermometer} 
                 label="Monitor Pasteurización" 
                 badge={0} 
                 colorClass="bg-emerald-100 text-emerald-600"
               />
             </div>
          </section>

          {/* Activity Log */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Clock size={20} className="text-slate-400" />
                Actividad Reciente del Sistema
              </h3>
              <button className="text-xs font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1">
                Ver bitácora completa <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {ACTIVITY.map(log => (
                <ActivityItem key={log.id} log={log} />
              ))}
            </div>
          </section>

        </div>

        {/* 4. RIGHT COLUMN: Alerts & Support */}
        <div className="space-y-6">
          
          {/* Alerts Panel */}
          <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-500" />
                Alertas y Recordatorios
              </h3>
              <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                3 Nuevas
              </span>
            </div>
            <div className="p-4 space-y-3">
              {ALERTS.map(alert => (
                <AlertItem key={alert.id} alert={alert} />
              ))}
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
               <button className="text-xs text-slate-500 hover:text-slate-800 font-medium">
                 Ver todas las notificaciones
               </button>
            </div>
          </section>

          {/* Status Summary (Mini Text) */}
          <section className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-md">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Thermometer size={16} className="text-emerald-400"/> Estado de Cadena de Frío
            </h4>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex justify-between">
                <span>Congelador A (Cruda)</span>
                <span className="text-white font-mono">-18°C</span>
              </div>
              <div className="flex justify-between">
                <span>Congelador B (Pasteurizada)</span>
                <span className="text-red-300 font-mono font-bold">-15°C ⚠️</span>
              </div>
              <div className="flex justify-between">
                <span>Refrigerador (Recepción)</span>
                <span className="text-white font-mono">4°C</span>
              </div>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;