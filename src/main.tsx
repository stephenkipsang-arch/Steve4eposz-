import React, { Component, StrictMode, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class StartupErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('MFA-VEXPEX startup/render error:', error, info);
  }

  render() {
    if (this.state.error) {
      const message = this.state.error.message || String(this.state.error);
      return (
        <div style={{
          fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#F0F2F5',
          color: '#050505'
        }}>
          <div style={{
            maxWidth: '620px',
            width: '100%',
            background: '#fff',
            borderRadius: '18px',
            padding: '28px',
            boxShadow: '0 6px 30px rgba(0,0,0,.10)'
          }}>
            <div style={{fontSize:'24px',fontWeight:800,color:'#1877F2',marginBottom:'10px'}}>MFA-VEXPEX startup error</div>
            <div style={{fontSize:'15px',lineHeight:1.6,color:'#444',wordBreak:'break-word'}}>{message}</div>
            <button
              onClick={() => window.location.reload()}
              style={{marginTop:'20px',border:0,borderRadius:'10px',padding:'12px 18px',background:'#1877F2',color:'#fff',fontWeight:700}}
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = document.getElementById('root');
if (!root) throw new Error('MFA-VEXPEX root element is missing.');

createRoot(root).render(
  <StrictMode>
    <StartupErrorBoundary>
      <App />
    </StartupErrorBoundary>
  </StrictMode>,
);

(window as any).__MFA_VEXPEX_BOOTED__ = true;
