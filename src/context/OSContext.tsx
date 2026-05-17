import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { OSWindow, AppConfig } from '../types';

export interface OSFile {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

interface OSContextType {
  windows: OSWindow[];
  apps: AppConfig[];
  activeWindowId: string | null;
  files: OSFile[];
  openApp: (appId: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  toggleMaximizeWindow: (id: string) => void;
  saveFile: (name: string, content: string) => void;
  readFile: (id: string) => OSFile | undefined;
  deleteFile: (id: string) => void;
}

const OSContext = createContext<OSContextType | null>(null);

export function OSProvider({ children, apps }: { children: ReactNode; apps: AppConfig[] }) {
  const [windows, setWindows] = useState<OSWindow[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [topZIndex, setTopZIndex] = useState(10);
  const [files, setFiles] = useState<OSFile[]>([
    {
      id: 'readme-1',
      name: 'readme.txt',
      content: 'Welcome to Web OS!\n\nThis is a simple virtual file system.\nYou can save notes here from the Notepad app.',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  ]);

  // Try to load files from local storage on mount
  useEffect(() => {
    const savedFiles = localStorage.getItem('webos_files');
    if (savedFiles) {
      try {
        setFiles(JSON.parse(savedFiles));
      } catch (e) {
        console.error("Failed to load files", e);
      }
    }
  }, []);

  // Save files to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('webos_files', JSON.stringify(files));
  }, [files]);

  const saveFile = (name: string, content: string) => {
    setFiles(prev => {
      const existing = prev.find(f => f.name === name);
      if (existing) {
        return prev.map(f => f.name === name ? { ...f, content, updatedAt: Date.now() } : f);
      }
      return [...prev, {
        id: `file-${Date.now()}`,
        name,
        content,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }];
    });
  };

  const readFile = (id: string) => files.find(f => f.id === id);

  const deleteFile = (id: string) => setFiles(prev => prev.filter(f => f.id !== id));

  const openApp = (appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    // Check if app already open
    const existingWindow = windows.find(w => w.appId === appId);
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        minimizeWindow(existingWindow.id); // unminimize
      }
      focusWindow(existingWindow.id);
      return;
    }

    const newId = `win-${Date.now()}`;
    const newZ = topZIndex + 1;
    setTopZIndex(newZ);
    
    setWindows(prev => [
      ...prev,
      {
        id: newId,
        appId,
        title: app.title,
        isMinimized: false,
        isMaximized: false,
        zIndex: newZ,
      }
    ]);
    setActiveWindowId(newId);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const focusWindow = (id: string) => {
    const newZ = topZIndex + 1;
    setTopZIndex(newZ);
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: newZ } : w));
    setActiveWindowId(id);
  };

  const minimizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: !w.isMinimized } : w));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const toggleMaximizeWindow = (id: string) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    focusWindow(id);
  };

  return (
    <OSContext.Provider
      value={{
        windows,
        apps,
        activeWindowId,
        files,
        openApp,
        closeWindow,
        focusWindow,
        minimizeWindow,
        toggleMaximizeWindow,
        saveFile,
        readFile,
        deleteFile
      }}
    >
      {children}
    </OSContext.Provider>
  );
}

export const useOS = () => {
  const context = useContext(OSContext);
  if (!context) throw new Error("useOS must be used within OSProvider");
  return context;
};
