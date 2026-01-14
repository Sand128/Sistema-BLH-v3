import React, { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Donors from './components/Donors';
import Jars from './components/Jars';
import Analysis from './components/Analysis'; 
import Batches from './components/Batches';
import Inventory from './components/Inventory';
import Receivers from './components/Receivers';
import Reports from './components/Reports';
import Users from './components/Users'; // Imported Users module
import AIAssistant from './components/AIAssistant';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'donors': return <Donors />;
      case 'jars': return <Jars />;
      case 'analysis': return <Analysis />;
      case 'batches': return <Batches />;
      case 'inventory': return <Inventory />;
      case 'receivers': return <Receivers />;
      case 'reports': return <Reports />;
      case 'users': return <Users />; // Added route for Users
      case 'assistant': return <AIAssistant />;
      default: return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
          <div className="bg-slate-100 p-8 rounded-full mb-4">
             <Search size={48} className="text-slate-300" />
          </div>
          <h2 className="text-xl font-semibold text-slate-600">Módulo en construcción</h2>
          <p className="text-sm">La vista <span className="font-mono text-pink-500">{currentView}</span> estará disponible en la Fase 2.</p>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Global App Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                LactanciaEdoMex <span className="text-pink-500 font-black">Digital</span>
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-800">Dr. Alejandro Méndez</span>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                Coordinador Estatal
              </span>
            </div>
            <div className="h-10 w-10 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-full border-2 border-white shadow-md p-0.5 cursor-pointer hover:scale-105 transition-transform">
               <img 
                 src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alejandro" 
                 alt="Perfil" 
                 className="h-full w-full object-cover rounded-full bg-white" 
               />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50">
           <div className="p-4 md:p-8 min-h-full">
             {renderView()}
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;