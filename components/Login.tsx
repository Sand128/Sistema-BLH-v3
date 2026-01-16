import React, { useState, useEffect } from 'react';
import { User, Lock, Moon, Sun, Baby, HeartPulse, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  // Estados del Formulario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados de UI/UX
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Validación en tiempo real
  useEffect(() => {
    // Regla: No vacío y formato email (o el usuario especial 'admin')
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidUser = emailRegex.test(username) || username === 'admin';
    const isValidPass = password.length > 0;
    
    setIsFormValid(isValidUser && isValidPass);
    setError(''); // Limpiar errores al escribir
  }, [username, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsLoading(true);
    setError('');

    try {
      await authService.login(username, password);
      // Notificar al componente padre (App.tsx) para cambiar la vista
      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || 'Error de conexión. Intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen w-full flex font-sans transition-colors duration-500 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      
      {/* --- COLUMNA IZQUIERDA: FORMULARIO (40%) --- */}
      <div className="w-full lg:w-5/12 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 relative z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-r border-white/20">
        
        {/* Toggle Theme (Absolute) */}
        <button 
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Header Institucional */}
        <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4 mb-6 opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Placeholder para Logos - En producción usar <img> */}
             <div className="flex flex-col">
               <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Gobierno del Estado de México</span>
               <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">Secretaría de Salud | ISEM</h2>
             </div>
             <div className="h-8 w-[1px] bg-slate-300"></div>
             <div className="text-xs text-pink-600 font-bold uppercase tracking-wide">
               Coordinación de Lactancia
             </div>
          </div>

          <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-xl text-pink-600 dark:text-pink-400">
               <HeartPulse size={28} />
             </div>
             <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Bienvenido</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            Ingrese sus credenciales para acceder al sistema de gestión.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
          
          {/* Alerta de Error */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm animate-in shake">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Input Usuario */}
          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
              Usuario / Correo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-pink-500 transition-colors">
                <User size={20} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all"
              />
            </div>
          </div>

          {/* Input Password */}
          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-pink-500 transition-colors">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between text-sm pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
              <input type="checkbox" className="rounded border-slate-300 text-pink-600 focus:ring-pink-500" />
              <span>Recordarme</span>
            </label>
            <a href="#" className="font-semibold text-pink-600 hover:text-pink-700 hover:underline">
              ¿Olvidó su clave?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]
              ${!isFormValid || isLoading 
                ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed text-slate-500 shadow-none' 
                : 'bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 shadow-pink-500/30'}
            `}
          >
            {isLoading ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                <span>Accediendo...</span>
              </>
            ) : (
              "Entrar al Sistema"
            )}
          </button>

        </form>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Coordinación Estatal de Lactancia Materna y Bancos de Leche</p>
          <p className="mt-1">Versión 2.0.1 (Fase Demo)</p>
        </div>
      </div>

      {/* --- COLUMNA DERECHA: VISUAL (60%) --- */}
      <div className="hidden lg:block w-7/12 relative overflow-hidden bg-slate-900">
        
        {/* Background Image with Ken Burns Effect */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?q=80&w=2574&auto=format&fit=crop" 
            alt="Lactancia Materna" 
            className="w-full h-full object-cover opacity-60 animate-[scale-in_20s_infinite_alternate]"
          />
        </div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/40 via-purple-900/40 to-blue-900/40 mix-blend-overlay z-1"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-1"></div>

        {/* Floating Glass Card (Quote) */}
        <div className="absolute bottom-20 right-20 max-w-lg z-20 animate-in slide-in-from-right-10 duration-1000">
           <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-8 rounded-3xl shadow-2xl text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-full">
                  <Baby size={24} />
                </div>
                <h3 className="text-xl font-bold tracking-wide">Nutrición & Amor</h3>
              </div>
              <p className="text-xl font-light italic leading-relaxed opacity-90 mb-4">
                "La lactancia materna es el vínculo de amor que vuelve sanos, fuertes y felices a nuestros niños."
              </p>
              <div className="h-1 w-20 bg-pink-500 rounded-full"></div>
           </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-10 right-10 z-10 opacity-30">
           <div className="w-64 h-64 bg-pink-500 rounded-full blur-[100px]"></div>
        </div>
      </div>

    </div>
  );
};

export default Login;
