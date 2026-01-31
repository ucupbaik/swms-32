import React from 'react';

export default function BottomNav({ menus, activeMenu, onSelect }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-white/95 backdrop-blur sm:hidden">
      <div className="grid grid-cols-5">
        {menus.slice(0,5).map(m => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={`flex flex-col items-center gap-1 py-2 text-xs ${activeMenu===m.id ? 'text-emerald-600' : 'text-gray-500'}`}
          >
            {m.icon}
            <span className="leading-none">{m.short || m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
