import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FlaskConical, 
  ClipboardList, 
  Bot, 
  Settings, 
  LogOut,
  Milk,
  TestTube2,
  PackageCheck,
  Baby,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, setIsOpen }) => {
  // Menu structure based on PDR
  const menuItems = [
    { id: 'dashboard', label: 'Tablero Principal', icon: LayoutDashboard },
    { id: 'donors', label: 'Donadoras', icon: Users },
    { id: 'jars', label: 'Frascos (Extracción)', icon: Milk },
    { id: 'analysis', label: 'Análisis', icon: TestTube2 },
    { id: 'batches', label: 'Lotes / Pasteurización', icon: PackageCheck },
    { id: 'inventory', label: 'Inventario General', icon: FlaskConical },
    { id: 'receivers', label: 'Receptores', icon: Baby },
    { id: 'reports', label: 'Reportes', icon: ClipboardList },
    { id: 'users', label: 'Usuarios y Seguridad', icon: ShieldCheck }, // New Module
    { id: 'assistant', label: 'Asistente IA', icon: Bot },
  ];

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
        flex flex-col
      `}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-center">
          <div className="flex flex-col items-center">
             <div className="h-12 w-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2 shadow-sm">
               EM
             </div>
             <h1 className="text-sm font-bold text-slate-800 text-center uppercase tracking-wide">Banco de Leche</h1>
             <p className="text-[10px] text-slate-500 font-medium">ISEM - Estado de México</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setCurrentView(item.id);
                    // Close sidebar on mobile when item selected
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                    ${currentView === item.id 
                      ? 'bg-pink-50 text-pink-700 shadow-sm border border-pink-100' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'}
                  `}
                >
                  <item.icon size={18} className={currentView === item.id ? 'text-pink-500' : 'text-slate-400'} />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-sm rounded-lg transition-all">
            <Settings size={18} className="text-slate-400" />
            Configuración
          </button>
          <button className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-red-600 hover:bg-red-50 hover:shadow-sm rounded-lg mt-1 transition-all">
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;