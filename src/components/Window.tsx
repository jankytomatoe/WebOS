import React, { useRef, useEffect } from 'react';
import { motion, useDragControls } from 'motion/react';
import { Minus, Square, X } from 'lucide-react';
import { useOS } from '../context/OSContext';
import { OSWindow } from '../types';

interface WindowProps {
  win: OSWindow;
  children: React.ReactNode;
  defaultWidth?: number;
  defaultHeight?: number;
}

export function Window({ win, children, defaultWidth = 600, defaultHeight = 400 }: WindowProps) {
  const { focusWindow, closeWindow, minimizeWindow, toggleMaximizeWindow, activeWindowId } = useOS();
  const dragControls = useDragControls();
  const isFocused = activeWindowId === win.id;

  if (win.isMinimized) return null;

  return (
    <motion.div
      drag={!win.isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      onMouseDown={() => focusWindow(win.id)}
      initial={{ 
        x: window.innerWidth / 2 - defaultWidth / 2 + (win.zIndex * 10), 
        y: window.innerHeight / 2 - defaultHeight / 2 + (win.zIndex * 10),
        opacity: 0,
        scale: 0.95
      }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        width: win.isMaximized ? '100vw' : defaultWidth,
        height: win.isMaximized ? 'calc(100vh - 80px)' : defaultHeight,
        x: win.isMaximized ? 0 : undefined,
        y: win.isMaximized ? 0 : undefined,
      }}
      transition={{ duration: 0.2 }}
      style={{ 
        zIndex: win.zIndex,
        position: 'absolute'
      }}
      className={`backdrop-blur-3xl bg-black/40 rounded-2xl shadow-2xl overflow-hidden border flex flex-col transition-colors ${
        isFocused ? 'border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'border-white/20'
      }`}
    >
      {/* Title bar */}
      <div 
        className={`h-10 flex items-center justify-between px-4 shrink-0 border-b ${
          isFocused ? 'bg-white/5 border-white/20 text-white' : 'bg-transparent border-white/10 text-white/50'
        }`}
        onPointerDown={(e) => {
          if (!win.isMaximized) dragControls.start(e);
        }}
      >
        <div className="font-medium text-xs opacity-70 select-none pointer-events-none flex items-center tracking-wide">
          {win.title}
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={(e) => { e.stopPropagation(); minimizeWindow(win.id); }}
            className="w-3.5 h-3.5 rounded-full bg-yellow-500 hover:bg-yellow-400 border border-yellow-600 transition-colors flex items-center justify-center p-0"
            title="Minimize"
          />
          <button 
            onClick={(e) => { e.stopPropagation(); toggleMaximizeWindow(win.id); }}
            className="w-3.5 h-3.5 rounded-full bg-green-500 hover:bg-green-400 border border-green-600 transition-colors flex items-center justify-center p-0"
            title="Maximize"
          />
          <button 
            onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
            className="w-3.5 h-3.5 rounded-full bg-red-500 hover:bg-red-400 border border-red-600 transition-colors flex items-center justify-center p-0"
            title="Close"
          />
        </div>
      </div>
      
      {/* Content area */}
      <div className="flex-1 overflow-auto bg-transparent relative rounded-b-2xl">
        {children}
      </div>
    </motion.div>
  );
}
