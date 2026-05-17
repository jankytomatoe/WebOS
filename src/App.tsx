import React from 'react';
import { Code, FileText, LayoutDashboard, Globe, HardDrive, Cloud, Smile } from 'lucide-react';
import { OSProvider, useOS } from './context/OSContext';
import { AppConfig } from './types';
import { Window } from './components/Window';
import { Taskbar } from './components/Taskbar';
import { Desktop } from './components/Desktop';

// Import Apps
import { NotepadApp } from './apps/NotepadApp';
import { WebDevApp } from './apps/WebDevApp';
import { FileExplorerApp } from './apps/FileExplorerApp';
import { BrowserApp } from './apps/BrowserApp';
import { CloudApp } from './apps/CloudApp';
import { EmojiApp } from './apps/EmojiApp';

// Define the apps available in the OS
const APPS: AppConfig[] = [
  {
    id: 'web-studio',
    title: 'Web Studio',
    icon: <Code />,
    component: WebDevApp,
    defaultWidth: 850,
    defaultHeight: 550,
    backgroundColor: 'from-cyan-500 to-blue-700'
  },
  {
    id: 'notepad',
    title: 'Notepad',
    icon: <FileText />,
    component: NotepadApp,
    defaultWidth: 550,
    defaultHeight: 450,
    backgroundColor: 'from-purple-500 to-pink-600'
  },
  {
    id: 'file-explorer',
    title: 'Files',
    icon: <HardDrive />,
    component: FileExplorerApp,
    defaultWidth: 750,
    defaultHeight: 500,
    backgroundColor: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'browser',
    title: 'Browser',
    icon: <Globe />,
    component: BrowserApp,
    defaultWidth: 900,
    defaultHeight: 600,
    backgroundColor: 'from-red-500 to-orange-600'
  },
  {
    id: 'cloud',
    title: 'Cloud Sync',
    icon: <Cloud />,
    component: CloudApp,
    defaultWidth: 600,
    defaultHeight: 450,
    backgroundColor: 'from-sky-400 to-blue-500'
  },
  {
    id: 'emojis',
    title: 'Emojis',
    icon: <Smile />,
    component: EmojiApp,
    defaultWidth: 400,
    defaultHeight: 500,
    backgroundColor: 'from-yellow-400 to-orange-500'
  }
];

function OSRunner() {
  const { windows, apps } = useOS();

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-gradient-to-br from-[#1a1c2c] via-[#4a1942] to-[#893168] text-white font-sans select-none"
    >
      <Desktop />
      
      {/* Render open windows */}
      {windows.map(win => {
        const app = apps.find(a => a.id === win.appId);
        if (!app) return null;
        
        const AppComponent = app.component;
        
        return (
          <Window 
            key={win.id} 
            win={win} 
            defaultWidth={app.defaultWidth} 
            defaultHeight={app.defaultHeight}
          >
            <AppComponent windowId={win.id} />
          </Window>
        );
      })}

      <Taskbar />
    </div>
  );
}

export default function App() {
  return (
    <OSProvider apps={APPS}>
      <OSRunner />
    </OSProvider>
  );
}
