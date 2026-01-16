import React, { useState } from 'react';
import { 
  Shield, Key, Lock, User, Activity, Clock, 
  CheckCircle2, AlertCircle, Save, Eye, EyeOff, Building 
} from 'lucide-react';
import { User as UserType } from '../types';

interface SecuritySettingsProps {
  user: UserType;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ user }) => {
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field: string, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    setStatus('IDLE');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validaciones simples
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      setErrorMessage('Todos los campos son obligatorios.');
      setStatus('ERROR');
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setErrorMessage('La nueva contraseña y la confirmación no coinciden.');
      setStatus('ERROR');
      return;
    }

    if (passwords.new.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres.');
      setStatus('ERROR');
      return;
    }

    // Simulación de éxito
    setTimeout(() => {
      setStatus('SUCCESS');
      setPasswords({ current: '', new: '', confirm: '' });
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-200">
          <Shield size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Configuración de Seguridad</h2>
          <p className="text-slate-500 text-sm">Gestione sus credenciales y revise su información de acceso.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: INFORMACIÓN DE ACCESO (SOLO LECTURA) */}
        <div className="space-y-6">
          
          {/* Identity Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-slate-800 to-slate-900 relative">
              <div className="absolute -bottom-10 left-6">
                <div className="w-20 h-20 bg-white rounded-full p-1 shadow-md">
                  <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-2xl">
                    {user.fullName.charAt(0)}
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-12 px-6 pb-6">
              <h3 className="text-lg font-bold text-slate-800">{user.fullName}</h3>
              <p className="text-sm text-slate-500">{user.email}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
                  <Shield size={10} /> {user.roles[0]?.toUpperCase() || 'USUARIO'}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  user.status === 'ACTIVE' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                    : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  <Activity size={10} /> {user.status === 'ACTIVE' ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>
            </div>
          </div>

          {/* Access Details */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-wider">Detalles de Sesión</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Building className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-slate-500">Unidad Médica Asignada</p>
                  <p className="text-sm font-medium text-slate-800 leading-tight">{user.hospitalName}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-slate-500">Último Inicio de Sesión</p>
                  <p className="text-sm font-medium text-slate-800">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Lock className="text-slate-400 mt-0.5" size={18} />
                <div>
                  <p className="text-xs text-slate-500">Autenticación de Dos Factores</p>
                  <p className={`text-sm font-bold ${user.twoFactorEnabled ? 'text-emerald-600' : 'text-slate-600'}`}>
                    {user.twoFactorEnabled ? 'Activada' : 'Desactivada'}
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* COLUMNA DERECHA: CAMBIO DE CONTRASEÑA */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Key size={20} className="text-pink-600"/> Actualizar Contraseña
              </h3>
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 text-sm flex items-center gap-1"
              >
                {showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            
            <div className="p-6">
              {status === 'SUCCESS' && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-800 animate-in zoom-in">
                  <CheckCircle2 size={24} className="text-emerald-600"/>
                  <div>
                    <p className="font-bold text-sm">¡Contraseña actualizada!</p>
                    <p className="text-xs">Su clave de acceso ha sido modificada correctamente.</p>
                  </div>
                </div>
              )}

              {status === 'ERROR' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-800 animate-in shake">
                  <AlertCircle size={24} className="text-red-600"/>
                  <div>
                    <p className="font-bold text-sm">Error de validación</p>
                    <p className="text-xs">{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña Actual</label>
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={passwords.current}
                    onChange={(e) => handleChange('current', e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña</label>
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={passwords.new}
                    onChange={(e) => handleChange('new', e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Nueva Contraseña</label>
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) => handleChange('confirm', e.target.value)}
                    className={`w-full p-3 border rounded-lg focus:ring-2 outline-none transition-all ${
                      passwords.confirm && passwords.new !== passwords.confirm
                        ? 'border-red-300 focus:ring-red-200' 
                        : 'border-slate-300 focus:ring-pink-500 focus:border-transparent'
                    }`}
                    placeholder="Repita la nueva contraseña"
                  />
                  {passwords.confirm && passwords.new !== passwords.confirm && (
                    <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                  )}
                </div>

                <div className="pt-4 flex items-center justify-end">
                  <button 
                    type="submit"
                    disabled={!passwords.current || !passwords.new || !passwords.confirm}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                  >
                    <Save size={18} />
                    Guardar Nueva Contraseña
                  </button>
                </div>

              </form>
            </div>
            <div className="bg-slate-50 p-4 border-t border-slate-200 rounded-b-xl text-center">
               <p className="text-xs text-slate-500">
                 Por seguridad, se enviará una notificación a su correo institucional al realizar este cambio.
               </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SecuritySettings;