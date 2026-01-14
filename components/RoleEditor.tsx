import React, { useState } from 'react';
import { Save, X, Shield, Lock, Unlock } from 'lucide-react';
import { Role } from '../types';

interface RoleEditorProps {
  role: Role;
  onSave: (role: Role) => void;
  onCancel: () => void;
}

const MODULES = [
  { id: 'donors', label: 'Donadoras', perms: ['view', 'create', 'edit', 'delete'] },
  { id: 'jars', label: 'Frascos', perms: ['view', 'create', 'verify', 'discard'] },
  { id: 'batches', label: 'Lotes', perms: ['view', 'create', 'pasteurize', 'release'] },
  { id: 'inventory', label: 'Inventario', perms: ['view', 'move', 'discard'] },
  { id: 'users', label: 'Usuarios', perms: ['view', 'create', 'edit', 'audit'] },
];

const RoleEditor: React.FC<RoleEditorProps> = ({ role, onSave, onCancel }) => {
  const [roleName, setRoleName] = useState(role.name);
  const [permissions, setPermissions] = useState<string[]>(role.permissions);

  const togglePermission = (perm: string) => {
    setPermissions(prev => 
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleSave = () => {
    onSave({ ...role, name: roleName, permissions });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Shield size={20} className="text-purple-600"/> 
              Editor de Roles
            </h3>
            <p className="text-xs text-slate-500">Defina los permisos granulares para este rol.</p>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Rol</label>
            <input 
              type="text" 
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg"
              disabled={role.isSystem}
            />
            {role.isSystem && <p className="text-xs text-amber-600 mt-1">Este es un rol de sistema, el nombre no se puede cambiar.</p>}
          </div>

          <div className="space-y-6">
            {MODULES.map(mod => (
              <div key={mod.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 text-sm">
                  {mod.label}
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {mod.perms.map(p => {
                    const permId = `${mod.id}:${p}`;
                    const isEnabled = permissions.includes(permId);
                    return (
                      <button 
                        key={permId}
                        onClick={() => togglePermission(permId)}
                        className={`flex items-center gap-2 text-sm p-2 rounded-lg border transition-all ${
                          isEnabled 
                            ? 'bg-purple-50 border-purple-200 text-purple-700' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {isEnabled ? <Unlock size={14}/> : <Lock size={14}/>}
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3 rounded-b-xl">
          <button onClick={onCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium">Cancelar</button>
          <button onClick={handleSave} className="px-6 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-bold flex items-center gap-2 shadow-sm">
            <Save size={18}/> Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleEditor;