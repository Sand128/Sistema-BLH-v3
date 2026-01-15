import React from 'react';
import { ArrowLeft, Mail, Building, Clock, Shield, User, Edit, Key, Ban, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { User as UserType } from '../types';

interface UserProfileProps {
  user: UserType;
  onBack: () => void;
  onEdit: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onBack, onEdit }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'SUSPENDED': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'INACTIVE': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle size={14} />;
      case 'SUSPENDED': return <AlertTriangle size={14} />;
      case 'INACTIVE': return <XCircle size={14} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Perfil de Usuario</h2>
          <p className="text-slate-500 text-sm">Información detallada y gestión de cuenta</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Identity Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-32 bg-slate-800 relative">
             <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
                   <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-3xl overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                      ) : (
                        user.fullName.charAt(0)
                      )}
                   </div>
                </div>
             </div>
          </div>
          <div className="pt-16 pb-8 px-6 text-center">
             <h3 className="text-xl font-bold text-slate-800">{user.fullName}</h3>
             <p className="text-sm text-slate-500 mb-4">{user.employeeId || 'Sin ID de Empleado'}</p>
             
             <div className="flex justify-center gap-2 mb-6 flex-wrap">
               {user.roles.map(role => (
                 <span key={role} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-100 uppercase tracking-wide">
                   <Shield size={10} /> {role}
                 </span>
               ))}
             </div>

             <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getStatusColor(user.status)}`}>
               {getStatusIcon(user.status)}
               <span className="text-sm font-bold">{user.status === 'ACTIVE' ? 'Activo' : user.status === 'INACTIVE' ? 'Inactivo' : 'Suspendido'}</span>
             </div>
          </div>
        </div>

        {/* Right Column: Details & Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Detailed Info */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h4 className="text-sm font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
              <User size={16}/> Información General
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Correo Electrónico</label>
                 <div className="flex items-center gap-2 text-slate-800 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">
                   <Mail size={16} className="text-slate-400"/> {user.email}
                 </div>
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Hospital / Unidad</label>
                 <div className="flex items-center gap-2 text-slate-800 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">
                   <Building size={16} className="text-slate-400"/> {user.hospitalName}
                 </div>
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Último Acceso</label>
                 <div className="flex items-center gap-2 text-slate-800 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">
                   <Clock size={16} className="text-slate-400"/> {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca'}
                 </div>
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Seguridad</label>
                 <div className="flex items-center gap-2 text-slate-800 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100">
                   <Shield size={16} className={user.twoFactorEnabled ? "text-emerald-500" : "text-slate-400"}/> 
                   {user.twoFactorEnabled ? '2FA Activado' : '2FA Desactivado'}
                 </div>
               </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Acciones de Cuenta</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <button 
                 onClick={onEdit}
                 className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
               >
                 <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                   <Edit size={20} />
                 </div>
                 <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Editar Datos</span>
               </button>

               <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50 transition-all group">
                 <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                   <Key size={20} />
                 </div>
                 <span className="text-sm font-bold text-slate-700 group-hover:text-amber-700">Resetear Password</span>
               </button>

               <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50 transition-all group">
                 <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                   <Ban size={20} />
                 </div>
                 <span className="text-sm font-bold text-slate-700 group-hover:text-red-700">
                   {user.status === 'ACTIVE' ? 'Suspender Acceso' : 'Reactivar'}
                 </span>
               </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserProfile;