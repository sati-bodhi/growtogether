import React, { useState, useCallback } from 'react';

const NativeCamera = ({ onCapture, onNativeCapture }) => {
  const [imageData, setImageData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target.result;
      setImageData(imageDataUrl);

      fetch(imageDataUrl)
        .then(res => res.blob())
        .then(blob => {
          if (onNativeCapture) {
            onNativeCapture(imageDataUrl, blob);
          } else if (onCapture) {
            onCapture(imageDataUrl, blob);
          }
          setIsProcessing(false);
        })
        .catch(err => {
          console.error("Error processing image:", err);
          setIsProcessing(false);
        });
    };
    reader.readAsDataURL(file);
  }, [onCapture, onNativeCapture]);

  const reset = useCallback(() => {
    setImageData(null);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px'
    }}>
      {imageData ? (
        <>
          <img 
            src={imageData} 
            alt="Captured" 
            style={{ 
              maxWidth: '100%', 
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }} 
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={reset}
              style={{
                padding: '10px 20px',
                background: '#555',
                color: 'white',
                border: 'none',
                borderRadius: '4px'
              }}
            >
              Retake
            </button>
          </div>
        </>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          background: '#f8f9fa',
          marginBottom: '20px'
        }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <label 
              htmlFor="camera-input"
              style={{
                display: 'inline-block',
                padding: '15px 30px',
                background: '#4CAF50',
                color: 'white',
                borderRadius: '30px',
                cursor: 'pointer',
                fontWeight: 'bold',
                boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
              }}
            >
              {isProcessing ? 'Processing...' : 'Open Camera'}
            </label>
            
            <input
              id="camera-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={isProcessing}
            />
            
            <p style={{ marginTop: '15px', color: '#666' }}>
              Click to open your device's camera
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NativeCamera;