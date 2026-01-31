import React from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { useToast } from './useToast';

function iconFor(type) {
  if (type === 'success') return <CheckCircle2 size={16} />;
  if (type === 'error') return <AlertTriangle size={16} />;
  return <Info size={16} />;
}

export default function ToastStack() {
  const { toasts } = useToast();
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 z-[9999] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="toast flex items-center gap-2 rounded-xl shadow-lg border bg-white/95 backdrop-blur px-4 py-3 text-sm"
        >
          <span className="text-gray-700">{iconFor(t.type)}</span>
          <span className="text-gray-800">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
