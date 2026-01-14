import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { Download, RefreshCw, TrendingUp, TrendingDown, Users, Milk, CheckCircle2 } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const DATA_VOLUME_TYPE = [
  { name: 'Calostro', value: 1800 },
  { name: 'Transición', value: 1200 },
  { name: 'Madura', value: 900 },
  { name: 'Prematuro', value: 300 },
];

const DATA_QUALITY_TREND = [
  { name: 'Ene', rechazos: 35, aprobados: 320 },
  { name: 'Feb', rechazos: 38, aprobados: 340 },
  { name: 'Mar', rechazos: 32, aprobados: 310 },
  { name: 'Abr', rechazos: 30, aprobados: 350 },
  { name: 'May', rechazos: 40, aprobados: 380 },
];

const MetricCard = ({ title, value, trend, trendValue, icon: Icon, color }: any) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
        <Icon size={20} className={color.replace('bg-', 'text-')} />
      </div>
      {trend && (
        <span className={`flex items-center text-xs font-bold ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
          {trend === 'up' ? <TrendingUp size={14} className="mr-1"/> : <TrendingDown size={14} className="mr-1"/>}
          {trendValue}
        </span>
      )}
    </div>
    <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    <p className="text-sm text-slate-500">{title}</p>
  </div>
);

const DashboardExecutive: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Dashboard Ejecutivo</h2>
          <p className="text-slate-500 text-sm">Resumen de indicadores clave de rendimiento (KPIs)</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <RefreshCw size={18} />
          </button>
          <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 flex items-center gap-2 text-sm font-medium">
            <Download size={16} /> Exportar Datos
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Donadoras Activas" 
          value="45" 
          trend="up" 
          trendValue="12.5%" 
          icon={Users} 
          color="bg-pink-500" 
        />
        <MetricCard 
          title="Volumen Procesado" 
          value="4.2 L" 
          trend="up" 
          trendValue="15.1%" 
          icon={Milk} 
          color="bg-blue-500" 
        />
        <MetricCard 
          title="Tasa de Rechazo" 
          value="9.5%" 
          trend="down" // Bad direction
          trendValue="+1.3%" 
          icon={CheckCircle2} 
          color="bg-orange-500" 
        />
        <MetricCard 
          title="Receptores Atendidos" 
          value="32" 
          trend="neutral" 
          trendValue="0%" 
          icon={Users} 
          color="bg-purple-500" 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Volume by Type */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[350px]">
          <h3 className="font-bold text-slate-800 mb-6">Volumen por Tipo de Leche (mL)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={DATA_VOLUME_TYPE}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {DATA_VOLUME_TYPE.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Quality Trend */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[350px]">
          <h3 className="font-bold text-slate-800 mb-6">Tendencia de Calidad (Mensual)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={DATA_QUALITY_TREND}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="aprobados" name="Frascos Aprobados" fill="#10b981" />
              <Bar dataKey="rechazos" name="Frascos Rechazados" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

export default DashboardExecutive;