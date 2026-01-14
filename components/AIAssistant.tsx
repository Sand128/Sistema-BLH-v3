import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Info, BookOpen, HelpCircle, FileText } from 'lucide-react';
import { generateAssistantResponse } from '../services/geminiService';
import { AssistantMessage } from '../types';

const HELP_TOPICS = [
  { id: 'donors', label: 'Registro de Donadoras', prompt: 'Explícame el proceso y requisitos para registrar una nueva donadora en el sistema.' },
  { id: 'analysis', label: 'Criterios de Análisis', prompt: '¿Cuáles son los criterios de aceptación y rechazo en el análisis fisicoquímico (Acidez, Color, Off-flavor)?' },
  { id: 'batches', label: 'Gestión de Lotes', prompt: '¿Cómo funciona la asignación de frascos a lotes y el proceso de pasteurización?' },
  { id: 'glossary', label: 'Glosario Técnico', prompt: 'Muéstrame el glosario de términos técnicos del BLH (Dornic, Crematocrito, PEPS).' },
  { id: 'inventory', label: 'Reglas de Inventario', prompt: '¿Cómo funciona el sistema PEPS y el control de caducidades en almacenamiento?' },
];

const AIAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: 'model',
      text: 'Bienvenido al Módulo de Ayuda del Banco de Leche Humana (ISEM). Estoy aquí para orientarte sobre la normatividad, criterios operativos y el uso correcto del sistema. Selecciona un tema o escribe tu duda.',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: AssistantMessage = {
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Provide context about the 'screen' the user might be looking at, 
    // or general system status.
    const contextData = `
      Sistema: Gestión Administrativa BLH - Estado de México.
      Usuario: Personal de Salud / Administrativo.
      Objetivo: Soporte Operativo y Normativo.
    `;

    const responseText = await generateAssistantResponse(userMessage.text, contextData);

    const botMessage: AssistantMessage = {
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Centro de Ayuda y Normatividad</h3>
            <p className="text-xs text-slate-500">Soporte Operativo BLH - ISEM</p>
          </div>
        </div>
        <div className="group relative">
           <HelpCircle size={18} className="text-slate-400 cursor-help" />
           <div className="absolute right-0 top-8 w-72 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
             Este módulo ofrece orientación sobre procesos y criterios. No sustituye el juicio clínico ni modifica registros automáticamente.
           </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${msg.role === 'user' ? 'bg-slate-200' : 'bg-blue-100'}
            `}>
              {msg.role === 'user' ? <User size={16} className="text-slate-600" /> : <Bot size={16} className="text-blue-600" />}
            </div>
            <div className={`
              max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed
              ${msg.role === 'user' 
                ? 'bg-slate-800 text-white rounded-tr-none' 
                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none shadow-sm'}
            `}>
              {msg.text.split('\n').map((line, i) => (
                <p key={i} className="mb-1 last:mb-0 min-h-[1rem]">{line}</p>
              ))}
              <span className={`text-[10px] block mt-1 opacity-70 ${msg.role === 'user' ? 'text-slate-300' : 'text-slate-400'}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Bot size={16} className="text-blue-600" />
            </div>
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
               <Loader2 size={16} className="animate-spin text-blue-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts & Input Area */}
      <div className="bg-white border-t border-slate-200">
        {/* Quick Topics */}
        <div className="px-4 py-3 border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
          {HELP_TOPICS.map(topic => (
            <button
              key={topic.id}
              onClick={() => handleSend(topic.prompt)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-full text-xs font-medium transition-colors whitespace-nowrap"
            >
              <FileText size={12} />
              {topic.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-4">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu duda sobre procesos o normatividad..."
              className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              disabled={isLoading}
            />
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-400 mt-2">
            La información proporcionada es orientativa. Consulta siempre los manuales oficiales del ISEM.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;