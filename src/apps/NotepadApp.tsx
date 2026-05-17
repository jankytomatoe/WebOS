import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { AlertCircle } from 'lucide-react';

export function NotepadApp() {
  const [text, setText] = useState('');
  const [filename, setFilename] = useState('untitled.txt');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [wrap, setWrap] = useState(true);
  const { saveFile, files } = useOS();

  const handleMenuClick = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleCommand = (command: string) => {
    setActiveMenu(null);
    switch (command) {
      case 'new':
        setText('');
        setFilename('untitled.txt');
        break;
      case 'save':
        const nameToSave = window.prompt("Enter filename to save:", filename);
        if (nameToSave) {
          setFilename(nameToSave);
          saveFile(nameToSave, text);
          alert(`Saved ${nameToSave}`);
        }
        break;
      case 'open':
        if (files.length === 0) {
          alert('No files available to open.');
          return;
        }
        const fileList = files.map((f, i) => `${i + 1}: ${f.name}`).join('\n');
        const fileChoice = window.prompt(`Select a file by number to open:\n${fileList}`);
        if (fileChoice) {
          const index = parseInt(fileChoice) - 1;
          const chosenFile = files[index];
          if (chosenFile) {
            setFilename(chosenFile.name);
            setText(chosenFile.content);
          } else {
            alert('Invalid file selection');
          }
        }
        break;
      case 'export':
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        break;
      case 'clear':
        setText('');
        break;
      case 'copy':
        navigator.clipboard.writeText(text).catch(() => alert('Copy failed'));
        break;
      case 'paste':
        navigator.clipboard.readText().then(val => setText(prev => prev + val)).catch(() => alert('Paste failed'));
        break;
      case 'upper':
        setText(text.toUpperCase());
        break;
      case 'lower':
        setText(text.toLowerCase());
        break;
      case 'wrap':
        setWrap(!wrap);
        break;
      case 'about':
        alert('WebOS Notepad\nA simple text editor for the browser.');
        break;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/10 backdrop-blur-md text-white" onClick={() => activeMenu && setActiveMenu(null)}>
      <div className="flex items-center p-1.5 bg-white/5 border-b border-white/10 relative">
        {/* Menu Items */}
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); handleMenuClick('file'); }} className="px-3 py-1 text-xs hover:bg-white/20 rounded transition-colors">File</button>
          {activeMenu === 'file' && (
            <div className="absolute left-0 mt-1 w-32 bg-slate-800 border border-slate-700 rounded shadow-xl z-50 py-1">
              <button onClick={() => handleCommand('new')} className="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-700">New</button>
              <button onClick={() => handleCommand('open')} className="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-700">Open...</button>
              <button onClick={() => handleCommand('save')} className="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-700">Save to WebOS</button>
              <button onClick={() => handleCommand('export')} className="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-700">Export to Device</button>
            </div>
          )}
        </div>
        
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); handleMenuClick('edit'); }} className="px-3 py-1 text-xs hover:bg-white/20 rounded transition-colors">Edit</button>
          {activeMenu === 'edit' && (
            <div className="absolute left-0 mt-1 w-32 bg-slate-800 border border-slate-700 rounded shadow-xl z-50 py-1">
              <button onClick={() => handleCommand('copy')} className="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-700">Copy</button>
              <button onClick={() => handleCommand('paste')} className="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-700">Paste</button>
              <button onClick={() => handleCommand('clear')} className="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-700 text-red-400">Clear All</button>
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); handleMenuClick('format'); }} className="px-3 py-1 text-xs hover:bg-white/20 rounded transition-colors">Format</button>
          {activeMenu === 'format' && (
            <div className="absolute left-0 mt-1 w-36 bg-slate-800 border border-slate-700 rounded shadow-xl z-50 py-1">
              <button onClick={() => handleCommand('upper')} className="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-700">UPPERCASE</button>
              <button onClick={() => handleCommand('lower')} className="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-700">lowercase</button>
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); handleMenuClick('view'); }} className="px-3 py-1 text-xs hover:bg-white/20 rounded transition-colors">View</button>
          {activeMenu === 'view' && (
            <div className="absolute left-0 mt-1 w-36 bg-slate-800 border border-slate-700 rounded shadow-xl z-50 py-1">
              <button onClick={() => handleCommand('wrap')} className="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-700 flex justify-between">
                <span>Word Wrap</span>
                {wrap && <span>✓</span>}
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); handleMenuClick('help'); }} className="px-3 py-1 text-xs hover:bg-white/20 rounded transition-colors">Help</button>
          {activeMenu === 'help' && (
            <div className="absolute left-0 mt-1 w-32 bg-slate-800 border border-slate-700 rounded shadow-xl z-50 py-1">
              <button onClick={() => handleCommand('about')} className="w-full text-left px-4 py-1.5 text-xs hover:bg-slate-700">About</button>
            </div>
          )}
        </div>

        <div className="ml-auto px-4 text-xs font-mono text-white/50">{filename}</div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className={`flex-1 w-full p-4 resize-none bg-transparent focus:outline-none font-sans text-white placeholder-white/50 ${wrap ? 'whitespace-pre-wrap' : 'whitespace-pre'}`}
        placeholder="Type here..."
        spellCheck={false}
      />
    </div>
  );
}
