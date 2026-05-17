import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';

export function WebDevApp() {
  const [html, setHtml] = useState(`<h1>Hello Web OS</h1>\n<p>Edit HTML, CSS, and JS below!</p>\n\n<button id="btn" class="modern-btn">Click Me!</button>`);
  const [css, setCss] = useState(`body { \n  font-family: sans-serif; \n  padding: 20px; \n  background: #f0f4f8; \n  color: #333;\n}\n\n.modern-btn {\n  background: #2563eb;\n  color: white;\n  border: none;\n  padding: 8px 16px;\n  border-radius: 6px;\n  cursor: pointer;\n  transition: 0.2s;\n}\n\n.modern-btn:hover {\n  background: #1d4ed8;\n}`);
  const [js, setJs] = useState(`document.getElementById('btn').addEventListener('click', () => {\n  alert('Button clicked from WebOS preview!');\n});`);
  
  const [srcDoc, setSrcDoc] = useState('');

  const updatePreview = () => {
    setSrcDoc(`
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `);
  };

  // Run once on mount
  useEffect(() => {
    updatePreview();
  }, []);

  return (
    <div className="flex flex-col h-full bg-transparent text-white">
      <div className="flex items-center justify-between px-4 py-2 bg-black/30 border-b border-white/10 backdrop-blur-md">
        <span className="text-xs font-medium tracking-wide opacity-80">Web Studio</span>
        <button 
          onClick={updatePreview}
          className="flex items-center space-x-1.5 bg-blue-500/80 hover:bg-blue-400/80 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-white/10"
        >
          <Play size={14} />
          <span>Run Preview</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-black/20">
        {/* Editors */}
        <div className="flex-1 flex flex-col md:w-1/2 border-r border-white/10 h-1/2 md:h-full">
          <div className="flex-1 flex flex-col border-b border-white/10">
            <div className="bg-black/40 px-3 py-1.5 text-[10px] text-white/50 uppercase tracking-widest font-mono border-b border-white/5">HTML</div>
            <textarea
              value={html}
              onChange={e => setHtml(e.target.value)}
              className="flex-1 bg-transparent border-none p-3 font-mono text-sm focus:outline-none resize-none text-white/90"
              spellCheck={false}
            />
          </div>
          <div className="flex-1 flex flex-col border-b border-white/10">
             <div className="bg-black/40 px-3 py-1.5 text-[10px] text-white/50 uppercase tracking-widest font-mono border-b border-white/5">CSS</div>
            <textarea
              value={css}
              onChange={e => setCss(e.target.value)}
              className="flex-1 bg-transparent border-none p-3 font-mono text-sm focus:outline-none resize-none text-blue-300"
              spellCheck={false}
            />
          </div>
          <div className="flex-1 flex flex-col">
             <div className="bg-black/40 px-3 py-1.5 text-[10px] text-white/50 uppercase tracking-widest font-mono border-b border-white/5">JS</div>
            <textarea
              value={js}
              onChange={e => setJs(e.target.value)}
              className="flex-1 bg-transparent border-none p-3 font-mono text-sm focus:outline-none resize-none text-yellow-300"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 bg-white h-1/2 md:h-full relative right-side-preview">
          <div className="absolute top-0 left-0 w-full px-3 py-1.5 bg-slate-100 border-b border-slate-200 text-slate-500 text-[10px] uppercase tracking-widest font-mono z-10 flex items-center shadow-sm">
            Browser Preview
          </div>
          <iframe 
            srcDoc={srcDoc}
            title="preview"
            sandbox="allow-scripts"
            className="w-full h-full border-none bg-white pt-8"
          />
        </div>
      </div>
    </div>
  );
}
