import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/App.css';
import Header from './components/layout/Header';
import DiagnosticsRouter from './diagnostics/DiagnosticsRouter';

const DIAGNOSTICS_KEY = 'enable_diagnostics';

const App = () => {
  const isDiagnosticsEnabled = () => {
    if (process.env.NODE_ENV === 'development') return true;
    return localStorage.getItem(DIAGNOSTICS_KEY) === 'true';
  };

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<div>Main Application</div>} />
        {isDiagnosticsEnabled() && (
          <Route path="/diagnostics/*" element={<DiagnosticsRouter />} />
        )}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </Router>
  );
};

export default App;
