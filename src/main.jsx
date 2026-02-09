import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './App.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Auto-reload when a new service worker takes over
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });

  // Check for SW updates every 60 seconds
  navigator.serviceWorker.ready.then((registration) => {
    setInterval(() => registration.update(), 60 * 1000);
  });
}
