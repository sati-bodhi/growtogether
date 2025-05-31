import React from 'react';
import { Link } from 'react-router-dom';
import Webcam from 'react-webcam';
import useCamera from '../../services/camera/hooks/useCamera';

const CameraDiagnostics = () => {
  const {
    webcamRef,
    photo,
    isLoading,
    error,
    facingMode,
    videoConstraints,
    uploadProgress,
    capturePhoto,
    resetPhoto,
    toggleFacingMode,
    uploadPhoto
  } = useCamera();

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <Link to="/diagnostics">← Back to Diagnostics</Link>
      <h1>Camera Diagnostics</h1>
      
      {!photo ? (
        <div>
          <div style={{ 
            border: '1px solid #ccc',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '20px',
            position: 'relative',
            background: '#000'
          }}>
            <Webcam
              audio={false}
              ref={webcamRef}
              videoConstraints={videoConstraints}
              screenshotFormat="image/jpeg"
              width="100%"
              height="auto"
              mirrored={facingMode === "user"}
              style={{ display: 'block' }}
              onUserMediaError={(err) => console.error("Webcam Error:", err)}
              playsInline={true}         // Add this for iOS
              forceScreenshotSourceSize  // Add this for consistent photos
            />
            
            {isLoading && (
              <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.6)',
                color: 'white'
              }}>
                Loading camera...
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button 
              onClick={toggleFacingMode}
              style={{
                padding: '10px 15px',
                background: '#555',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              Switch Camera ({facingMode === "user" ? "Front" : "Back"})
            </button>
            
            <button 
              onClick={capturePhoto}
              style={{
                padding: '10px 15px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              Take Photo
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ 
            border: '1px solid #ccc',
            borderRadius: '8px',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <img 
              src={photo} 
              alt="Captured" 
              style={{ display: 'block', width: '100%' }}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button 
              onClick={resetPhoto}
              style={{
                padding: '10px 15px',
                background: '#555',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              Retake Photo
            </button>
            
            <button 
              onClick={() => uploadPhoto('diagnostics')}
              disabled={isLoading}
              style={{
                padding: '10px 15px',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? `Uploading (${uploadProgress}%)` : 'Upload Photo'}
            </button>
          </div>
          
          {isLoading && (
            <div style={{ 
              height: '6px', 
              background: '#eee', 
              marginTop: '15px',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${uploadProgress}%`, 
                height: '100%', 
                background: '#4CAF50',
                transition: 'width 0.3s ease'
              }} />
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div style={{ 
          color: '#f44336', 
          marginTop: '20px', 
          padding: '10px', 
          background: '#ffebee', 
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
      
      <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3>Technical Notes</h3>
        <ul>
          <li>Using react-webcam for camera access</li>
          <li>Mock Cloudinary API for image uploads</li>
          <li>Test both front and back cameras if available</li>
        </ul>
      </div>
    </div>
  );
};

export default CameraDiagnostics;
