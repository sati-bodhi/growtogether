import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

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
