import React, { useState } from 'react';
import { useOS } from '../context/OSContext';
import { File, FileText, Trash2, HardDrive, Download } from 'lucide-react';

export function FileExplorerApp() {
  const { files, deleteFile } = useOS();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  const selectedFile = files.find(f => f.id === selectedFileId);

  return (
    <div className="flex flex-col h-full bg-white/10 backdrop-blur-md text-white font-sans">
      {/* Top action bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/30 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center space-x-2 text-xs font-medium tracking-wide opacity-80 uppercase">
          <HardDrive size={14} /> <span>C: / Users / Guest / Documents</span>
        </div>
        <div className="text-xs text-white/50">{files.length} items</div>
      </div>

      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* File List */}
        <div className="w-1/2 md:w-1/3 flex flex-col border-r border-white/10 bg-black/20 overflow-y-auto">
          {files.map(file => (
            <button
              key={file.id}
              onClick={() => setSelectedFileId(file.id)}
              className={`flex items-center px-4 py-3 space-x-3 text-left transition-colors border-b border-white/5 ${
                selectedFileId === file.id ? 'bg-blue-500/30' : 'hover:bg-white/10'
              }`}
            >
              <div className="text-blue-400">
                <FileText size={20} />
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-medium truncate">{file.name}</div>
                <div className="text-xs text-white/40 truncate">
                  {new Date(file.updatedAt).toLocaleString()}
                </div>
              </div>
            </button>
          ))}
          {files.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-white/40 text-sm p-4 text-center">
              No files found. Create one in Notepad.
            </div>
          )}
        </div>

        {/* File Preview */}
        <div className="flex-1 bg-black/40 overflow-y-auto p-6">
          {selectedFile ? (
            <div className="flex flex-col h-full max-w-2xl mx-auto align-middle">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <FileText size={32} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{selectedFile.name}</h2>
                    <p className="text-xs text-white/50">Text Document &bull; {selectedFile.content.length} bytes</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      const blob = new Blob([selectedFile.content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = selectedFile.name;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-lg text-sm transition-colors"
                  >
                    <Download size={16} /> <span>Download</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete ${selectedFile.name}?`)) {
                        deleteFile(selectedFile.id);
                        setSelectedFileId(null);
                      }
                    }}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg text-sm transition-colors"
                  >
                    <Trash2 size={16} /> <span>Delete</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex-1 relative overflow-auto shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]">
                <pre className="font-mono text-sm whitespace-pre-wrap leading-relaxed text-white/80">
                  {selectedFile.content}
                </pre>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-4">
              <File size={64} className="opacity-20" />
              <p className="text-sm font-medium">Select a file to preview</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
