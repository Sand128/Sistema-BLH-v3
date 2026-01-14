import React, { useState } from 'react';
import { Save, X, User, Shield, Lock, Building } from 'lucide-react';
import { User as UserType, Role } from '../types';

interface UserFormProps {
  initialData?: Partial<UserType>;
  roles: Role[];
  onSubmit: (data: UserType) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ initialData, roles, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<UserType>>({
    status: 'ACTIVE',
    twoFactorEnabled: false,
    roles: [],
    hospitalId: '5', // Mock Hospital ID
    ...initialData
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    if (!formData.fullName || !formData.email || !formData.roles?.length) {
      alert("Por favor complete los campos obligatorios");
      return;
    }
    
    // Mock ID generation
    const newUser: UserType = {
      ...formData as UserType,
      id: formData.id || Math.random().toString(36).substr(2, 9),
      employeeId: formData.employeeId || `EMP-${Math.floor(Math.random()*1000)}`,
      hospitalName: 'Hospital Mónica Pretelini' // Mock
    };
    onSubmit(newUser);
  };

  const handleRoleChange = (roleId: string) => {
    setFormData(prev => {
      const currentRoles = prev.roles || [];
      const newRoles = currentRoles.includes(roleId)
        ? currentRoles.filter(r => r !== roleId)
        : [...currentRoles, roleId];
      return { ...prev, roles: newRoles };
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 flex flex-col h-[calc(100vh-140px)]">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <User className="text-blue-500" />
            {initialData?.id ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <p className="text-xs text-slate-500">Gestión de acceso y roles</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
          
          {/* Personal Info */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
               <User size={18} className="text-slate-400"/> Datos Personales
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                   <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo *</label>
                   <input 
                     type="text" required
                     value={formData.fullName || ''}
                     onChange={e => setFormData({...formData, fullName: e.target.value})}
                     className="w-full p-2 border border-slate-300 rounded-lg"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Email Institucional *</label>
                   <input 
                     type="email" required
                     value={formData.email || ''}
                     onChange={e => setFormData({...formData, email: e.target.value})}
                     className="w-full p-2 border border-slate-300 rounded-lg"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                   <input 
                     type="tel"
                     value={formData.phone || ''}
                     onChange={e => setFormData({...formData, phone: e.target.value})}
                     className="w-full p-2 border border-slate-300 rounded-lg"
                   />
                </div>
             </div>
          </div>

          {/* Access & Security */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
               <Lock size={18} className="text-slate-400"/> Acceso y Seguridad
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hospital Asignado *</label>
                  <div className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg border border-slate-200 text-slate-600">
                    <Building size={16} /> Hospital Mónica Pretelini
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    <option value="ACTIVE">Activo</option>
                    <option value="SUSPENDED">Suspendido</option>
                    <option value="INACTIVE">Inactivo (Baja)</option>
                  </select>
               </div>
               <div className="md:col-span-2 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={formData.twoFactorEnabled}
                      onChange={e => setFormData({...formData, twoFactorEnabled: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-slate-700">Requerir Autenticación de Dos Factores (2FA)</span>
                  </label>
               </div>
             </div>
          </div>

          {/* Roles */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="font-bold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
               <Shield size={18} className="text-slate-400"/> Roles Asignados
             </h3>
             <div className="space-y-2">
               {roles.map(role => (
                 <label key={role.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                   formData.roles?.includes(role.id) ? 'bg-purple-50 border-purple-200' : 'hover:bg-slate-50'
                 }`}>
                   <input 
                     type="checkbox"
                     checked={formData.roles?.includes(role.id)}
                     onChange={() => handleRoleChange(role.id)}
                     className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                   />
                   <div>
                     <span className="block font-bold text-slate-800 text-sm">{role.name}</span>
                     <span className="text-xs text-slate-500">{role.description}</span>
                   </div>
                 </label>
               ))}
             </div>
          </div>

        </form>
      </div>

      <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-3">
        <button onClick={onCancel} className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">
          Cancelar
        </button>
        <button onClick={handleSubmit} className="px-8 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-lg shadow-md flex items-center gap-2">
          <Save size={18} /> Guardar Usuario
        </button>
      </div>
    </div>
  );
};

export default UserForm;