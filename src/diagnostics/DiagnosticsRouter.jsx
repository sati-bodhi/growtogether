import React from 'react';
import { Route, Routes, Link } from 'react-router-dom';

// Import only CameraDiagnostics, create placeholders for the others
import CameraDiagnostics from './services/CameraDiagnostics';

// Placeholder components for future implementation
const GardensDiagnostics = () => <div>Gardens Diagnostics - Coming Soon</div>;
const PlantsDiagnostics = () => <div>Plants Diagnostics - Coming Soon</div>;
const LocationDiagnostics = () => <div>Location Diagnostics - Coming Soon</div>;

const DiagnosticsRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<DiagnosticsHome />} />
      <Route path="/gardens" element={<GardensDiagnostics />} />
      <Route path="/plants" element={<PlantsDiagnostics />} />
      <Route path="/camera" element={<CameraDiagnostics />} />
      <Route path="/location" element={<LocationDiagnostics />} />
    </Routes>
  );
};

const DiagnosticsHome = () => (
  <div>
    <h1>Feature Diagnostics</h1>
    <p>Select a feature to test independently:</p>
    <ul>
      <li><Link to="/diagnostics/gardens">Gardens Feature</Link></li>
      <li><Link to="/diagnostics/plants">Plants Feature</Link></li>
      <li><Link to="/diagnostics/camera">Camera Service</Link></li>
      <li><Link to="/diagnostics/location">Location Service</Link></li>
    </ul>
  </div>
);

export default DiagnosticsRouter;
