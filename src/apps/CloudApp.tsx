import React, { useState } from 'react';
import { Cloud, UploadCloud, CheckCircle2, HardDrive, RefreshCw, Download } from 'lucide-react';
import { useOS } from '../context/OSContext';

export function CloudApp() {
  const { files } = useOS();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());
  const [syncedFiles, setSyncedFiles] = useState([...files]);

  const triggerSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setSyncedFiles([...files]);
      setLastSync(new Date());
      setIsSyncing(false);
    }, 1500);
  };

  const usedStorage = syncedFiles.reduce((acc, f) => acc + f.content.length, 0);
  const maxStorage = 50000; // Fake quota 50KB

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-indigo-900 to-blue-900 text-white font-sans rounded-b-2xl">
      <div className="flex items-center justify-between px-6 py-4 bg-black/20 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)] cursor-pointer hover:bg-blue-400 transition" onClick={triggerSync}>
            <Cloud size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">OS Cloud Drive</h1>
            <p className="text-xs text-blue-200">Syncs your local Virtual File System</p>
          </div>
        </div>
        <button 
          onClick={triggerSync}
          disabled={isSyncing}
          className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 border border-white/20 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Status Card */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg relative overflow-hidden backdrop-blur-sm">
            <div className="absolute -right-4 -top-4 opacity-5">
              <Cloud size={120} />
            </div>
            <h3 className="text-sm font-semibold text-blue-200 mb-4 uppercase tracking-wider">Sync Status</h3>
            <div className="flex items-center space-x-3">
              {isSyncing ? (
                <div className="animate-pulse flex items-center space-x-2 text-yellow-300">
                  <UploadCloud size={20} /> <span>Uploading changes...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-green-400">
                  <CheckCircle2 size={20} /> <span>Up to date</span>
                </div>
              )}
            </div>
            <p className="text-xs text-white/50 mt-4">Last synced: {lastSync.toLocaleString()}</p>
          </div>

          {/* Storage Quota */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-blue-200 mb-4 uppercase tracking-wider flex items-center"><HardDrive size={16} className="mr-2"/> Virtual Storage</h3>
            <div className="w-full bg-black/40 rounded-full h-3 mb-2 shadow-inner overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-400 to-indigo-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${Math.min(100, (usedStorage / maxStorage) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-white/60">
              <span>{usedStorage} bytes used</span>
              <span>{maxStorage} bytes total</span>
            </div>
          </div>
        </div>

        <h3 className="text-sm font-semibold text-blue-200 mb-4 uppercase tracking-wider px-2 border-b border-white/10 pb-2">Files in Cloud</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {syncedFiles.map((f, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors cursor-default group">
              <div className="w-10 h-10 bg-indigo-500/20 text-indigo-300 rounded-lg flex items-center justify-center shrink-0">
                <FileTextIcon />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{f.name}</p>
                <p className="text-xs text-white/40">{f.content.length} bytes</p>
              </div>
              <button 
                onClick={() => {
                  const blob = new Blob([f.content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = f.name;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="opacity-0 group-hover:opacity-100 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all focus:opacity-100"
                title="Download to Device"
              >
                <Download size={16} />
              </button>
            </div>
          ))}
          {syncedFiles.length === 0 && (
            <div className="col-span-full py-8 text-center text-white/40 text-sm">
              Your cloud drive is empty.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FileTextIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  );
}
