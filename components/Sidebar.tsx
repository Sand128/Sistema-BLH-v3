import React, { useState, useEffect } from 'react';
import { 
  User, 
  Layers, 
  Microscope, 
  Syringe, 
  FileText, 
  Trash2, 
  Users, 
  Lock, 
  HelpCircle,
  Milk,
  ChevronDown,
  ChevronRight,
  Package
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, setIsOpen }) => {
  // State to manage expanded menus
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Menu structure definition
  const menuItems = [
    { id: 'donors', label: 'Donadora', icon: User },
    { 
      id: 'collection', 
      label: 'Recolección', 
      icon: Milk,
      subItems: [
        { id: 'jars', label: 'Frascos' },
        { id: 'batches', label: 'Lotes' }
      ]
    },
    { id: 'analysis', label: 'Análisis', icon: Microscope },
    { id: 'inventory', label: 'Almacén', icon: Package }, // Renamed from Desecho/Trash2
    { id: 'receivers', label: 'Dosificación', icon: Syringe },
    { id: 'waste', label: 'Desecho', icon: Trash2 }, // New dedicated module
    { id: 'reports', label: 'Reportes', icon: FileText },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'auth', label: 'Autenticación', icon: Lock }, 
    { id: 'assistant', label: 'Ayuda', icon: HelpCircle },
  ];

  // Auto-expand parent if a child is active
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.subItems) {
        const hasActiveChild = item.subItems.some(sub => sub.id === currentView);
        if (hasActiveChild && !expandedMenus.includes(item.id)) {
          setExpandedMenus(prev => [...prev, item.id]);
        }
      }
    });
  }, [currentView]);

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleNavigation = (viewId: string) => {
    // Mapping logic for legacy/special views
    const targetView = viewId === 'auth' ? 'users' : viewId;
    setCurrentView(targetView);
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col font-sans
      `}>
        
        {/* Institutional Header */}
        <div className="px-6 py-8 border-b border-slate-100">
          <div className="flex flex-col gap-1">
             <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Gobierno de México</span>
             <h1 className="text-sm font-bold text-slate-800 uppercase leading-tight tracking-wide">Secretaría de Salud</h1>
             <div className="h-0.5 w-8 bg-slate-800 my-2"></div>
             <p className="text-[10px] text-slate-400 font-medium">Banco de Leche Humana</p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-1 px-4">
            {menuItems.map((item) => {
              // --- RENDERIZADO DE MÓDULO CON SUBMENÚS (Recolección) ---
              if (item.subItems) {
                const isExpanded = expandedMenus.includes(item.id);
                const isActiveParent = item.subItems.some(sub => sub.id === currentView);
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                        ${isActiveParent ? 'bg-slate-50 text-slate-900' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <item.icon strokeWidth={1.5} size={20} className={isActiveParent ? 'text-slate-800' : 'text-slate-400'} />
                        <span>{item.label}</span>
                      </div>
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {/* Submenu Items */}
                    {isExpanded && (
                      <ul className="mt-1 space-y-1 pl-11">
                        {item.subItems.map(sub => (
                          <li key={sub.id}>
                            <button
                              onClick={() => handleNavigation(sub.id)}
                              className={`
                                w-full text-left px-3 py-2 rounded-lg text-sm transition-colors relative
                                ${currentView === sub.id 
                                  ? 'text-pink-600 font-medium bg-pink-50' 
                                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}
                              `}
                            >
                              {currentView === sub.id && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-pink-500 rounded-r-full"></div>
                              )}
                              {sub.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }

              // --- RENDERIZADO DE MÓDULO SIMPLE ---
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.id)}
                    className={`
                      w-full flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                      ${currentView === item.id || (item.id === 'auth' && currentView === 'users_auth')
                        ? 'bg-slate-100 text-slate-900' 
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}
                    `}
                  >
                    <item.icon strokeWidth={1.5} size={20} className={
                      currentView === item.id 
                        ? 'text-slate-800' 
                        : 'text-slate-400 group-hover:text-slate-600'
                    } />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Footer Profile */}
        <div className="p-5 border-t border-slate-100 bg-white mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs">
              AD
            </div>
            <div className="overflow-hidden">
               <p className="text-xs font-bold text-slate-800 truncate uppercase tracking-wide">Administrador</p>
               <p className="text-[10px] text-slate-500 truncate">admin@salud.gob.mx</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;