import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, variant = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts((t) => [...t, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4500);
  }, []);

  const value = useMemo(() => ({ toast: push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex max-w-sm flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={[
                'pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur-xl',
                t.variant === 'success' && 'border-emerald-500/40 bg-emerald-500/15 text-emerald-100',
                t.variant === 'error' && 'border-red-500/40 bg-red-500/15 text-red-100',
                t.variant === 'info' && 'border-slate-600 bg-slate-900/90 text-slate-100'
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { toast: () => {} };
  }
  return ctx;
}
