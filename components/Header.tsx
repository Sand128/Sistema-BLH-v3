import React, { useState, useEffect } from 'react';
import { Menu, User, Bell, Moon, Sun, X, Check, ArrowRight } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
  onNavigate: (view: string) => void;
}

interface Notification {
  id: number;
  title: string;
  time: string;
  read: boolean;
  targetView: string; // Module ID to navigate to
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1, title: 'Lote LP-2024-001 liberado', time: 'Hace 5 min', read: false, targetView: 'batches' },
  { id: 2, title: 'Alerta de Temperatura: Congelador B', time: 'Hace 20 min', read: false, targetView: 'inventory' },
  { id: 3, title: 'Nueva donadora registrada', time: 'Hace 1 hora', read: true, targetView: 'donors' },
];

const Header: React.FC<HeaderProps> = ({ onMenuClick, onNavigate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // -- Theme State --
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check local storage or system preference
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // -- Notifications State --
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);

  // -- Effects --
  useEffect(() => {
    // Clock Timer
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Theme Application
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // -- Helpers --
  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (notif: Notification) => {
    // 1. Mark as read locally
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    // 2. Close dropdown
    setShowNotifications(false);
    // 3. Navigate to module
    onNavigate(notif.targetView);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Format Date: "miércoles, 14 de enero de 2026"
  const dateStr = currentDate.toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Format Time: "04:29 a.m."
  const timeStr = currentDate.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).toLowerCase();

  return (
    <>
      {/* Overlay to close dropdowns */}
      {showNotifications && (
        <div className="fixed inset-0 z-30 bg-transparent" onClick={() => setShowNotifications(false)}></div>
      )}

      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between flex-shrink-0 z-40 shadow-sm transition-colors duration-200 h-20">
        
        {/* --- LEFT SECTION: Branding --- */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white tracking-tight leading-tight">
              Banco de Leche Materna
            </h1>
            <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">
              Sistema de Control de Lactancia
            </p>
          </div>
        </div>

        {/* --- RIGHT SECTION: Date, Theme, Notifs, User --- */}
        <div className="flex items-center gap-3 md:gap-6">
          
          {/* 1. Date & Time (Hidden on small mobile) */}
          <div className="hidden xl:flex flex-col items-end text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 pr-6 mr-2">
            <span className="text-xs capitalize font-medium">{dateStr}</span>
            <span className="text-lg font-bold text-slate-800 dark:text-slate-200 leading-none">{timeStr}</span>
          </div>

          {/* 2. Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
            title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDarkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-blue-600" />}
            <span className="text-xs font-semibold hidden md:inline-block w-12 text-center">
              {isDarkMode ? 'Claro' : 'Oscuro'}
            </span>
          </button>

          {/* 3. Notification Bell */}
          <div className="relative">
            <button 
              onClick={toggleNotifications}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 rounded-full transition-all relative"
            >
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
              )}
            </button>

            {/* Dropdown */}
            {showNotifications && (
              <div className="absolute top-full mt-3 right-[-50px] md:right-0 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Notificaciones</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAsRead} className="text-xs text-pink-600 hover:text-pink-700 font-medium flex items-center gap-1">
                      <Check size={12} /> Marcar leídas
                    </button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-center text-sm text-slate-500">No tienes notificaciones.</p>
                  ) : (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-4 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group ${notif.read ? 'opacity-70' : 'bg-blue-50/30 dark:bg-blue-900/10'}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm ${!notif.read ? 'font-bold text-slate-800 dark:text-slate-200' : 'font-medium text-slate-600 dark:text-slate-400'}`}>
                            {notif.title}
                          </p>
                          {!notif.read && <span className="h-2 w-2 bg-pink-500 rounded-full mt-1.5 shrink-0"></span>}
                        </div>
                        <div className="flex justify-between items-end mt-1">
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">{notif.time}</p>
                          <span className="text-[10px] text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            Ir al módulo <ArrowRight size={10} />
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. User Section */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">Administrador</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px] font-medium tracking-wide">
                Administrador del...
              </p>
            </div>
            <div className="h-9 w-9 bg-slate-800 dark:bg-slate-700 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-600 shadow-md">
              <User size={18} />
            </div>
          </div>

        </div>
      </header>
    </>
  );
};

export default Header;