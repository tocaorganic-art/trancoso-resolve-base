import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import SentryInit from '@/components/optimization/SentryInit'
import PerformanceOptimizer from '@/components/optimization/PerformanceOptimizer'

ReactDOM.createRoot(document.getElementById('root')).render(
  <>
    <SentryInit />
    <PerformanceOptimizer />
    <App />
  </>
)

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:beforeUpdate' }, '*');
  });
  import.meta.hot.on('vite:afterUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:afterUpdate' }, '*');
  });
}