import './config/process-env'; // Add this as the first import
import React from 'react';
import { createRoot } from 'react-dom/client'; // Update import
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// New React 18 rendering method
const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();

// Add diagnostics enabler (hidden from normal users)
if (process.env.NODE_ENV === 'production') {
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
      localStorage.setItem('enable_diagnostics', 'true');
      console.log('Diagnostics mode enabled');
      window.location.reload();
    }
  });
}
