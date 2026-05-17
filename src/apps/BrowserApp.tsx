import React, { useState, useEffect, useRef } from 'react';
import { Globe, ArrowLeft, ArrowRight, RotateCcw, Shield, ShieldOff, Plus, X, Lock, Loader2, Cpu, Settings, ExternalLink, Maximize2, Monitor } from 'lucide-react';
import Hyperbeam from "@hyperbeam/web";

interface Tab {
  id: string;
  url: string;
  title: string;
  history: string[];
  historyIndex: number;
  isLoading: boolean;
  embedUrl: string | null;
  error: string | null;
}

const HyperbeamVM = ({ embedUrl, onReady, tabId }: { embedUrl: string, onReady: (hb: any) => void, tabId: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hbRef = useRef<any>(null);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    if (!containerRef.current || !embedUrl) return;

    let mounted = true;

    // Create a fresh wrapper div for this effect execution so React isn't confused
    // by Hyperbeam DOM mutations, and to safely handle Strict Mode double-invocations.
    const wrapper = document.createElement('div');
    wrapper.style.width = '100%';
    wrapper.style.height = '100%';
    containerRef.current.appendChild(wrapper);

    async function init() {
      try {
        const hb = await Hyperbeam(wrapper, embedUrl);
        if (mounted) {
          hbRef.current = hb;
          if (onReadyRef.current) {
            onReadyRef.current(hb);
          }
        } else {
          // If the effect was already cleaned up before init finished, destroy it
          hb.destroy();
        }
      } catch (err) {
        console.error("Hyperbeam init error:", err);
      }
    }

    init();

    return () => {
      mounted = false;
      if (hbRef.current) {
        hbRef.current.destroy();
        hbRef.current = null;
      }
      if (wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper);
      }
    };
  }, [embedUrl]);

  return (
    <div 
      id={`hb-container-${tabId}`}
      ref={containerRef} 
      style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
    />
  );
};

export function BrowserApp() {
  const [tabs, setTabs] = useState<Tab[]>([
    { 
      id: 'tab-1', 
      url: 'https://google.com', 
      title: 'Browser VM', 
      history: ['https://google.com'], 
      historyIndex: 0, 
      isLoading: false,
      embedUrl: null,
      error: null
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [urlInput, setUrlInput] = useState('https://google.com');
  const hbControllers = useRef<Record<string, any>>({});
  const initialSetupDone = useRef(false);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const updateTab = (id: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const createSession = async (id: string, startUrl: string) => {
    updateTab(id, { isLoading: true, error: null });
    try {
      const res = await fetch("/api/hyperbeam/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start_url: startUrl })
      });
      
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { error: text || `Server Error (Status ${res.status})` };
      }

      if (!res.ok) throw new Error(data.error || "Failed to provision VM");
      updateTab(id, { embedUrl: data.embed_url, isLoading: false });
    } catch (err: any) {
      updateTab(id, { error: err.message, isLoading: false });
    }
  };

  useEffect(() => {
    // Bootstrap initial tab
    if (!initialSetupDone.current && !tabs[0].embedUrl && !tabs[0].isLoading) {
      initialSetupDone.current = true;
      createSession(tabs[0].id, tabs[0].url);
    }
  }, []);

  const navigateTo = (url: string) => {
    const hb = hbControllers.current[activeTabId];
    if (hb) {
      // Hyperbeam uses a virtual browser, we can try to navigate its address bar if the API supports it
      // or just provision a new session with the new start_url (cleaner but slower)
      // Usually Hyperbeam sessions have their own browser UI.
      // If we want to force navigation from outside:
      hb.tabs.update({ url });
    } else {
      // If no session, create one
      createSession(activeTabId, url);
    }
    setUrlInput(url);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      navigateTo(urlInput.trim());
    }
  };

  const addTab = () => {
    const newId = `tab-${Date.now()}`;
    const newUrl = 'https://google.com';
    const newTab: Tab = { 
      id: newId, 
      url: newUrl, 
      title: 'New VM', 
      history: [newUrl], 
      historyIndex: 0, 
      isLoading: false,
      embedUrl: null,
      error: null
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
    setUrlInput(newUrl);
    createSession(newId, newUrl);
  };

  const removeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      const prevTab = newTabs[newTabs.length - 1];
      setActiveTabId(prevTab.id);
      setUrlInput(prevTab.url);
    }
    delete hbControllers.current[id];
  };

  const switchTab = (tab: Tab) => {
    setActiveTabId(tab.id);
    setUrlInput(tab.url);
  };

  return (
    <div className="flex flex-col h-full bg-[#111] text-white font-sans rounded-b-2xl overflow-hidden ring-1 ring-white/10">
      {/* Hyperbeam Meta Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-black border-b border-white/5 text-[10px] font-mono lowercase tracking-wider text-blue-400">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Monitor size={10} className="mr-1.5" />
            <span>VM_ENGINE: CLOUD_RENDERED</span>
          </div>
          <div className="flex items-center opacity-70">
            <Cpu size={10} className="mr-1.5" />
            <span>Latency: Optimized</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-emerald-500 animate-pulse">●</span>
          <span>Hyperbeam_Handshake_Secure</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center px-1 pt-1 bg-[#1a1a1a] space-x-0.5">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            onClick={() => switchTab(tab)}
            className={`group relative flex items-center px-4 py-2 min-w-[120px] max-w-[200px] rounded-t-xl transition-all ${
              activeTabId === tab.id 
                ? 'bg-[#222] text-white' 
                : 'bg-transparent text-white/40 hover:bg-white/5 hover:text-white/60'
            }`}
          >
            <div className="w-3.5 h-3.5 mr-2 shrink-0 flex items-center justify-center">
               {tab.isLoading ? <Loader2 size={10} className="animate-spin text-blue-400" /> : <Globe size={11} />}
            </div>
            <span className="text-[11px] truncate flex-1 font-medium select-none">{tab.title}</span>
            <button 
              onClick={(e) => removeTab(tab.id, e)}
              className={`ml-2 w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/10 ${tabs.length === 1 ? 'invisible' : ''} ${activeTabId === tab.id ? 'opacity-50' : 'opacity-0 group-hover:opacity-50'}`}
            >
              <X size={10} />
            </button>
            {activeTabId === tab.id && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500 rounded-full" />}
          </div>
        ))}
        <button onClick={addTab} className="p-2 hover:bg-white/5 text-white/40 mb-1 transition-colors">
          <Plus size={14} />
        </button>
      </div>

      {/* Browser Controls */}
      <div className="flex items-center px-4 py-3 bg-[#222] border-b border-white/5 gap-4">
        <div className="flex items-center gap-1 shrink-0">
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 disabled:opacity-20 transition-all active:scale-90">
            <ArrowLeft size={16} />
          </button>
          <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 disabled:opacity-20 transition-all active:scale-90">
            <ArrowRight size={16} />
          </button>
          <button onClick={() => navigateTo(activeTab.url)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors">
            <RotateCcw size={14} />
          </button>
        </div>

        <form onSubmit={submitSearch} className="flex-1">
          <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500">
               <Lock size={12} />
            </div>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-[13px] focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 text-slate-100 transition-all placeholder-white/20 font-mono"
              placeholder="Enter URL or Search..."
            />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg text-white/30 hover:bg-white/10 transition-colors">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Viewport */}
      <div className="flex-1 bg-black relative">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`w-full h-full absolute inset-0 ${activeTabId === tab.id ? 'z-10 visible' : 'z-0 invisible pointer-events-none'}`}
          >
            {tab.error ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-500 bg-[#0a0a0a]">
                <div className="w-16 h-16 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
                  <ShieldOff size={32} />
                </div>
                <h3 className="text-sm font-semibold text-white">VM Boot Failure</h3>
                <p className="text-xs max-w-xs text-center border border-white/5 p-4 rounded-xl">
                  {tab.error}
                </p>
                <button 
                  onClick={() => createSession(tab.id, tab.url)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors mt-4"
                >
                  Retry Boot Sequence
                </button>
              </div>
            ) : tab.isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 bg-[#0a0a0a] text-blue-500">
                <Loader2 className="animate-spin" size={32} />
                <div className="text-[10px] font-mono tracking-widest animate-pulse">PROVISIONING_ISOLATED_CLOUD_INSTANCE...</div>
              </div>
            ) : tab.embedUrl ? (
              <HyperbeamVM 
                embedUrl={tab.embedUrl} 
                tabId={tab.id}
                onReady={(hb) => { hbControllers.current[tab.id] = hb; }} 
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
