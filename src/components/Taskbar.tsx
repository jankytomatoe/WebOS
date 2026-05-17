import React, { useState, useEffect } from 'react';
import { Terminal, Code, FileText, MonitorPlay, Calculator, Play, Command, RefreshCw } from 'lucide-react';
import { useOS } from '../context/OSContext';

export function Taskbar() {
  const { apps, windows, openApp, focusWindow, minimizeWindow, activeWindowId } = useOS();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center px-4 py-2 space-x-2 backdrop-blur-2xl bg-white/10 border border-white/20 rounded-2xl shadow-xl z-[9999] select-none text-white overflow-visible transition-all">
      <div className="flex items-center space-x-3">
        {/* Start Button */}
        <button className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl hover:bg-white/30 cursor-pointer transition-colors shadow-sm">
          <Command size={22} className="drop-shadow-md" />
        </button>

        <div className="w-1 h-8 bg-white/10 rounded-full mx-1" />

        {/* Taskbar Apps */}
        {apps.map(app => {
          const win = windows.find(w => w.appId === app.id);
          const isOpen = !!win;
          const isActive = win?.id === activeWindowId && !win?.isMinimized;

          return (
            <button
              key={app.id}
              onClick={() => {
                if (!isOpen) openApp(app.id);
                else if (isActive) minimizeWindow(win.id);
                else focusWindow(win.id);
              }}
              className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all cursor-pointer ${
                isActive ? 'bg-white/40 shadow-inner' : 'bg-white/20 hover:bg-white/30 shadow-sm'
              }`}
              title={app.title}
            >
              <div className={`w-full h-full absolute inset-0 rounded-xl bg-gradient-to-b ${app.backgroundColor} opacity-50 z-0`}></div>
              {React.cloneElement(app.icon, { 
                size: 24, 
                className: `z-10 transition-transform drop-shadow-md ${isActive ? 'scale-95' : 'scale-100'} ${isOpen ? 'text-white' : 'text-white/80'}`
              })}
              
              {/* Indicator dot */}
              {isOpen && (
                <div className={`absolute -bottom-1.5 w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white shadow-[0_0_8px_white]' : 'bg-white/50'}`} />
              )}
            </button>
          );
        })}
      </div>

      <div className="w-1 h-8 bg-white/10 rounded-full mx-1" />

      {/* Clock */}
      <div className="h-12 flex flex-col justify-center px-3 hover:bg-white/10 rounded-xl cursor-default text-right leading-tight whitespace-nowrap space-y-0.5 transition-colors">
        <div className="text-sm font-medium">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        <div className="text-[10px] opacity-70">{time.toLocaleDateString()}</div>
      </div>
    </div>
  );
}
