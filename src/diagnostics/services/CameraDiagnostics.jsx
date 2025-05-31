import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import WebCameraModal from '../../services/camera/components/WebCameraModal';
import './CameraDiagnostics.css';

const CameraDiagnostics = () => {
  const [showWebcam, setShowWebcam] = useState(false);
  const [useNativeCamera, setUseNativeCamera] = useState(false); // We'll set this in useEffect
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  
  // Detect mobile device once on component mount
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Set default camera type based on device, but respect user preference if saved
  useEffect(() => {
    const savedPref = localStorage.getItem('useNativeCamera');
    
    if (savedPref !== null) {
      // User has a saved preference, use that
      setUseNativeCamera(savedPref === 'true');
    } else {
      // No saved preference, default based on device type
      setUseNativeCamera(isMobileDevice);
      localStorage.setItem('useNativeCamera', isMobileDevice);
    }
  }, [isMobileDevice]);

  const handleToggleCamera = () => {
    const newValue = !useNativeCamera;
    setUseNativeCamera(newValue);
    localStorage.setItem('useNativeCamera', newValue);
  };

  const handleActivateCamera = () => {
    setError(null);
    if (useNativeCamera) {
      fileInputRef.current?.click();
    } else {
      handleOpenWebCamera();
    }
  };

  const handleOpenWebCamera = () => {
    setError(null);
    setShowWebcam(true);
  };

  const handleNativeCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setPhoto(dataUrl);

      fetch(dataUrl)
        .then(res => res.blob())
        .catch(err => setError(`Failed to process image: ${err.message}`));
    };
    reader.readAsDataURL(file);
  };

  const handleWebcamCapture = (dataUrl) => {
    setPhoto(dataUrl);
    fetch(dataUrl)
      .then(res => res.blob())
      .catch(err => setError(`Failed to process image: ${err.message}`));
    setShowWebcam(false);
  };

  return (
    <div className="camera-diagnostics">
      <Link to="/diagnostics">← Back to Diagnostics</Link>
      <h1>Camera Diagnostics</h1>
      
      <div className="camera-options">
        <div className="option-label">Camera Interface</div>
        <div className="toggle-container">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={!useNativeCamera}
              onChange={handleToggleCamera}
            />
            <span className="toggle-slider"></span>
          </label>
          <span>{useNativeCamera ? 'Using Native Camera' : 'Using Web Camera'}</span>
        </div>
      </div>
      
      {!photo ? (
        <div className="camera-activation">
          <button 
            onClick={handleActivateCamera} 
            className="activate-button"
          >
            Open {useNativeCamera ? 'Native' : 'Web'} Camera
          </button>
          <p className="instruction">
            Click the button above to activate the {useNativeCamera ? 'native device' : 'web'} camera
          </p>
          <p className="device-info">
            <small>
              {isMobileDevice ? 'Mobile device detected' : 'Desktop device detected'} 
              {useNativeCamera !== isMobileDevice ? ' (overridden by user)' : ''}
            </small>
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleNativeCapture}
            style={{ display: 'none' }}
          />
        </div>
      ) : (
        <div className="photo-preview">
          <img src={photo} alt="Captured" />
          <div className="photo-actions">
            <button onClick={() => setPhoto(null)}>Retake</button>
            <button>Upload (Mock)</button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <WebCameraModal 
        isOpen={showWebcam}
        onClose={() => setShowWebcam(false)}
        onCapture={handleWebcamCapture}
      />
      
      <div className="technical-notes">
        <h2>Technical Notes</h2>
        <ul>
          <li>Using react-webcam for photography</li>
          <li>Mock Cloudinary API for image uploads</li>
          <li>Toggle between web camera and native device camera</li>
          <li><strong>Default:</strong> Native camera on mobile, Web camera on desktop</li>
        </ul>
      </div>
    </div>
  );
};

export default CameraDiagnostics;
