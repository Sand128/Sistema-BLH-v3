import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header'; 
import Dashboard from './components/Dashboard';
import Donors from './components/Donors';
import Jars from './components/Jars';
import Analysis from './components/Analysis'; 
import Batches from './components/Batches';
import Inventory from './components/Inventory';
import Receivers from './components/Receivers';
import Reports from './components/Reports';
import Users from './components/Users';
import AIAssistant from './components/AIAssistant';
import WasteRegistry from './components/WasteRegistry'; 
import Login from './components/Login';
import { NotificationProvider } from './context/NotificationContext';

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check for session (Simple Mock Persistence)
  useEffect(() => {
    const session = localStorage.getItem('blh_session');
    if (session === 'active') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    localStorage.setItem('blh_session', 'active');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('blh_session');
    setIsAuthenticated(false);
    setCurrentView('dashboard'); // Reset view
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentView} />;
      case 'donors': return <Donors />;
      case 'jars': return <Jars />;
      case 'analysis': return <Analysis />;
      case 'batches': return <Batches />;
      case 'inventory': return <Inventory />;
      case 'receivers': return <Receivers />;
      case 'waste': return <WasteRegistry />; 
      case 'reports': return <Reports />;
      case 'users': return <Users />;
      case 'assistant': return <AIAssistant />;
      // Handle explicit auth/logout request from sidebar if needed
      case 'auth': 
        handleLogout();
        return null;
      default: return (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600">
          <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-full mb-4">
             <Search size={48} className="text-slate-300 dark:text-slate-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-400">Módulo en construcción</h2>
          <p className="text-sm">La vista <span className="font-mono text-pink-500">{currentView}</span> estará disponible en la Fase 2.</p>
        </div>
      );
    }
  };

  // --- GATEKEEPER ---
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <NotificationProvider>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-200">
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
          <Header 
            onMenuClick={() => setIsSidebarOpen(true)} 
            onNavigate={setCurrentView}
          />

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50">
             <div className="p-4 md:p-8 min-h-full">
               {renderView()}
             </div>
          </div>
        </main>
      </div>
    </NotificationProvider>
  );
};

export default App;