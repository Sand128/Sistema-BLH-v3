import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppNotification } from '../types';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (title: string, type?: 'info' | 'success' | 'warning' | 'error', target?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { 
      id: '1', 
      title: 'Sistema iniciado correctamente', 
      timestamp: new Date(Date.now() - 3600000), 
      read: true, 
      type: 'info' 
    },
    { 
      id: '2', 
      title: 'Alerta de Temperatura: Congelador B (-12°C)', 
      timestamp: new Date(Date.now() - 1800000), 
      read: false, 
      type: 'warning',
      targetView: 'inventory'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (title: string, type: 'info' | 'success' | 'warning' | 'error' = 'info', target?: string) => {
    const newNote: AppNotification = {
      id: Date.now().toString(),
      title,
      timestamp: new Date(),
      read: false,
      type,
      targetView: target
    };
    setNotifications(prev => [newNote, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      addNotification, 
      markAsRead, 
      markAllAsRead,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};
