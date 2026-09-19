import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const root = document.getElementById('root');
if (!root) throw new Error('MFA-VEXPEX root element is missing.');

try {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  (window as any).__MFA_VEXPEX_BOOTED__ = true;
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  root.innerHTML = '';
  const box = document.createElement('div');
  box.style.cssText = "font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#F0F2F5;color:#050505";
  const inner = document.createElement('div');
  inner.style.cssText = "max-width:560px;background:white;border-radius:16px;padding:28px;box-shadow:0 4px 24px rgba(0,0,0,.08);text-align:center";
  inner.innerHTML = '<div style="font-size:24px;font-weight:800;color:#1877F2;margin-bottom:10px">MFA-VEXPEX could not start</div><div style="font-size:14px;line-height:1.5;color:#65676B"></div>';
  inner.lastElementChild!.textContent = message;
  root.appendChild(box);
  box.appendChild(inner);
}

