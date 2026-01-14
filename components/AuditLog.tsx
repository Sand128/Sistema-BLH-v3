import React, { useState } from 'react';
import { Search, Filter, Download, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { AuditLogEntry } from '../types';

const MOCK_LOGS: AuditLogEntry[] = [
  { id: '1', timestamp: '2024-05-27T14:30:05', userId: '456', userName: 'Ana López', userRole: 'Enfermería', action: 'Crear Frasco', target: 'HO-2024-05-27-001', module: 'Frascos', status: 'SUCCESS', ip: '192.168.1.100', details: 'Donadora: María G.' },
  { id: '2', timestamp: '2024-05-27T14:35:12', userId: '456', userName: 'Ana López', userRole: 'Enfermería', action: 'Verificación Física', target: 'HO-2024-05-27-001', module: 'Frascos', status: 'SUCCESS', ip: '192.168.1.100', details: 'Temp: 4.2°C, Aprobado' },
  { id: '3', timestamp: '2024-05-27T15:30:45', userId: '789', userName: 'Juan Pérez', userRole: 'Químico', action: 'Aprobar Lote', target: 'LP-2024-05-27-001', module: 'Lotes', status: 'SUCCESS', ip: '192.168.1.105', details: 'Acidez: 1.8°D' },
  { id: '4', timestamp: '2024-05-27T16:00:00', userId: '123', userName: 'Admin', userRole: 'Administrador', action: 'Login Fallido', target: 'System', module: 'Auth', status: 'FAILURE', ip: '203.0.113.1', details: 'Contraseña incorrecta' },
  { id: '5', timestamp: '2024-05-27T16:05:00', userId: '456', userName: 'Ana López', userRole: 'Enfermería', action: 'Borrar Donadora', target: 'DG-005', module: 'Donadoras', status: 'FAILURE', ip: '192.168.1.100', details: 'Permiso denegado' },
];

const AuditLog: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModule, setFilterModule] = useState('all');

  const filteredLogs = MOCK_LOGS.filter(log => 
    (log.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
     log.target.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterModule === 'all' || log.module === filterModule)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por usuario, acción o objetivo..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="border border-slate-200 rounded-lg px-4 py-2 text-slate-600 bg-white"
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value)}
          >
            <option value="all">Todos los módulos</option>
            <option value="Frascos">Frascos</option>
            <option value="Lotes">Lotes</option>
            <option value="Donadoras">Donadoras</option>
            <option value="Auth">Seguridad</option>
          </select>
        </div>
        <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-2">
          <Download size={18} /> Exportar CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3">Fecha/Hora</th>
              <th className="px-6 py-3">Usuario</th>
              <th className="px-6 py-3">Módulo</th>
              <th className="px-6 py-3">Acción</th>
              <th className="px-6 py-3">Detalle</th>
              <th className="px-6 py-3 text-right">Resultado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-3 text-slate-500 font-mono text-xs">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="px-6 py-3">
                  <div className="font-medium text-slate-800">{log.userName}</div>
                  <div className="text-xs text-slate-400">{log.userRole}</div>
                </td>
                <td className="px-6 py-3">
                  <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">
                    {log.module}
                  </span>
                </td>
                <td className="px-6 py-3 font-medium text-slate-700">
                  {log.action} <span className="text-pink-600 ml-1">{log.target}</span>
                </td>
                <td className="px-6 py-3 text-slate-500 max-w-xs truncate" title={log.details}>
                  {log.details}
                </td>
                <td className="px-6 py-3 text-right">
                  {log.status === 'SUCCESS' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      <CheckCircle2 size={12}/> Exitoso
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                      <XCircle size={12}/> Fallido
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLogs.length === 0 && (
          <div className="p-8 text-center text-slate-400">No se encontraron eventos.</div>
        )}
      </div>
    </div>
  );
};

export default AuditLog;