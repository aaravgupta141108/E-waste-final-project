import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './registerServiceWorker';

// Safe non-blocking alert handler to prevent iframe sandboxing DOMException errors
if (typeof window !== 'undefined') {
  const originalAlert = window.alert;
  window.alert = (message?: any) => {
    console.log('[System Notice]', message);
    try {
      const existing = document.getElementById('global-safe-toast');
      if (existing) existing.remove();
      const toast = document.createElement('div');
      toast.id = 'global-safe-toast';
      toast.className = 'fixed top-4 right-4 z-[9999] max-w-md p-3.5 rounded-xl bg-slate-900 border border-emerald-500/60 shadow-2xl text-xs text-slate-100 font-sans flex items-start gap-2.5 transition-all';
      toast.innerHTML = `<span style="color:#34d399;font-weight:bold;font-size:14px;">✓</span><div style="flex:1;">${String(message || '')}</div><button style="color:#94a3b8;cursor:pointer;background:none;border:none;" onclick="this.parentElement.remove()">✕</button>`;
      document.body.appendChild(toast);
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 4500);
    } catch {
      if (typeof originalAlert === 'function') {
        try { originalAlert(message); } catch (_) {}
      }
    }
  };
}

registerServiceWorker();

createRoot(document.getElementById('root')!).render(<App />);
