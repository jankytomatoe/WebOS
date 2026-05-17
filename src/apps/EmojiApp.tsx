import React, { useState } from 'react';
import { Search, Copy, Check } from 'lucide-react';

const EMOJI_CATEGORIES = [
  { name: 'Smileys', emojis: ['😀','😃','😄','😁','😆','😅','😂','🤣','🥲','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😗','😙','😚','😋','😛','😝','😜','🤪','🤨','🧐','🤓','😎'] },
  { name: 'Gestures', emojis: ['👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🤝'] },
  { name: 'Animals', emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁','🐮','🐷','🐽','🐸','🐵','🙈','🙉','🙊','🐒','🐔','🐧','🐦','🐤','🐣','🐥','🦆','🦅','🦉'] },
  { name: 'Food', emojis: ['🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑','🥭','🍍','🥥','🥝','🍅','🍆','🥑','🥦','🥬','🥒','🌶','🫑','🌽','🥕','🫒','🧄','🧅'] },
  { name: 'Nature', emojis: ['🌍','🌎','🌏','🌐','🌑','🌒','🌓','🌔','🌕','🌖','🌗','🌘','🌙','🌚','🌛','🌜','☀️','🌝','🌞','⭐','🌟','🌠','☁️','⛅','⛈','🌤','🌥','🌦','🌧','🌨'] },
];

export function EmojiApp() {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (emoji: string) => {
    navigator.clipboard.writeText(emoji).then(() => {
      setCopiedId(emoji);
      setTimeout(() => setCopiedId(null), 1500);
    }).catch(err => {
      alert('Failed to copy emoji!');
      console.error(err);
    });
  };

  const filteredCategories = EMOJI_CATEGORIES.map(cat => ({
    ...cat,
    // Note: simple search, we don't have descriptions, so search applies to categories mostly or just acts as dummy
    // In a real app we'd map standard annotations. Here let's just show all or filter category name.
    emojis: search.trim() ? (cat.name.toLowerCase().includes(search.toLowerCase()) ? cat.emojis : []) : cat.emojis
  })).filter(c => c.emojis.length > 0);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-slate-200 font-sans rounded-b-2xl">
      <div className="p-4 bg-[#252526] border-b border-[#333]">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#3c3c3c] border border-transparent rounded-md py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:bg-[#404040] text-slate-200 transition-colors placeholder-slate-500"
            placeholder="Search categories (e.g. 'Animals')..."
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {filteredCategories.length === 0 && (
           <div className="text-center text-slate-500 mt-8 text-sm">No emojis found.</div>
        )}

        {filteredCategories.map((cat, i) => (
          <div key={i} className="mb-6">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-1">{cat.name}</h2>
            <div className="flex flex-wrap gap-2">
              {cat.emojis.map((emoji, j) => (
                <button
                  key={j}
                  onClick={() => handleCopy(emoji)}
                  className="relative w-10 h-10 text-2xl flex items-center justify-center hover:bg-white/10 active:bg-blue-500/30 rounded-lg transition-colors group"
                  title="Click to copy"
                >
                  <span className={copiedId === emoji ? 'opacity-0 scale-75 transition-all' : 'opacity-100 scale-100 transition-all duration-200'}>{emoji}</span>
                  
                  {/* Copied overlay */}
                  <div className={`absolute inset-0 flex items-center justify-center bg-blue-500 text-white rounded-lg transition-all duration-200 ${copiedId === emoji ? 'opacity-100 scale-100' : 'opacity-0 scale-75 cursor-default pointer-events-none'}`}>
                    <Check size={16} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Toast indicator at bottom */}
      <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg transition-all duration-300 ${copiedId ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
        Copied to clipboard! 📋
      </div>
    </div>
  );
}
