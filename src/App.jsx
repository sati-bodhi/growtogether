import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import Header from './components/layout/Header';
import DiagnosticsRouter from './diagnostics/DiagnosticsRouter';

const DIAGNOSTICS_KEY = 'enable_diagnostics';

const App = () => {
  // Use state instead of just a function for reactive rendering
  const [diagnosticsEnabled, setDiagnosticsEnabled] = useState(
    localStorage.getItem(DIAGNOSTICS_KEY) === 'true' || 
    process.env.NODE_ENV === 'development'
  );

  useEffect(() => {
    // URL parameter check
    const params = new URLSearchParams(window.location.search);
    if (params.get('enable_diagnostics') === 'true') {
      localStorage.setItem(DIAGNOSTICS_KEY, 'true');
      setDiagnosticsEnabled(true);
      window.location.href = '/diagnostics'; // Remove URL param
    }

    // Keyboard shortcut
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.altKey && e.shiftKey && e.code === 'KeyD') {
        // Toggle the diagnostics state
        const newState = !diagnosticsEnabled;
        
        if (newState) {
          // Enabling diagnostics
          localStorage.setItem(DIAGNOSTICS_KEY, 'true');
          setDiagnosticsEnabled(true);
          window.location.href = '/diagnostics';
        } else {
          // Disabling diagnostics
          localStorage.removeItem(DIAGNOSTICS_KEY);
          setDiagnosticsEnabled(false);
          window.location.href = '/'; // Redirect to home page
        }
        
        console.log(`Diagnostics ${newState ? 'enabled' : 'disabled'}`);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [diagnosticsEnabled]);

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<div>Main Application</div>} />
        {diagnosticsEnabled && (
          <Route path="/diagnostics/*" element={<DiagnosticsRouter />} />
        )}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </Router>
  );
};

export default App;
