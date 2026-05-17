import React from 'react';
import { useOS } from '../context/OSContext';

export function Desktop() {
  const { apps, openApp } = useOS();

  return (
    <div className="absolute inset-0 p-8 flex flex-col gap-y-10 items-start overflow-hidden z-0 content-start flex-wrap">
      {apps.map((app) => (
        <button
          key={app.id}
          onClick={() => openApp(app.id)}
          className="flex flex-col items-center justify-start w-24 p-2 rounded hover:bg-white/10 transition-colors group cursor-pointer"
        >
          <div className={`w-12 h-12 rounded-xl mb-2 flex items-center justify-center text-white shadow-lg border border-white/20 bg-gradient-to-b ${app.backgroundColor || 'from-gray-700 to-gray-900'}`}>
            {React.cloneElement(app.icon, { size: 28, className: 'drop-shadow-md' })}
          </div>
          <span className="text-white text-[11px] font-medium text-center drop-shadow-md group-hover:drop-shadow-lg leading-tight">
            {app.title}
          </span>
        </button>
      ))}
    </div>
  );
}
