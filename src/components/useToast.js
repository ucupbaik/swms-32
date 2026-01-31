import { createContext, useContext, useMemo, useState } from 'react';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const api = useMemo(() => ({
    toasts,
    push: (message, type = 'info') => {
      const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
      setToasts((t) => [...t, { id, message, type }]);
      setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), 2500);
    },
    remove: (id) => setToasts((t) => t.filter(x => x.id !== id))
  }), [toasts]);

  return <ToastCtx.Provider value={api}>{children}</ToastCtx.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
