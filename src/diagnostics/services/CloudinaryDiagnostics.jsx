import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// import WebCameraModal from '../../services/camera/components/WebCameraModal';
import { functions } from '../../services/firebase'; // Import from your existing firebase.jsx
import { httpsCallable } from 'firebase/functions';
// import { isFeatureEnabled } from '../../features/featureFlag';
import cloudinaryService from '../../services/cloudinary/cloudinaryService';

const CloudinaryDiagnostics = () => {
  const [photo, setPhoto] = useState(null);
  const [photoBlob, setPhotoBlob] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [uploadedPublicId, setUploadedPublicId] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [logMessages, setLogMessages] = useState([]);
  const [testResults, setTestResults] = useState(null);
  const [useServerSide, setUseServerSide] = useState(true);
  const [successMessage, setSuccessMessage] = useState(null);
  const fileInputRef = React.useRef(null);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogMessages(prev => [...prev, { timestamp, message, type }]);
  };

  const testApiConnection = async () => {
    addLog(`Testing ${useServerSide ? 'server-side' : 'client-side'} Cloudinary API connection...`);
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setTestResults(null);

    try {
      let result;
      if (useServerSide) {
        try {
          addLog('Testing via HTTP endpoint...');
          const response = await fetch("http://127.0.0.1:5001/blng-beda9/us-central1/testCloudinaryConnectionHttp", {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          result = await response.json();
        } catch (httpErr) {
          addLog(`HTTP endpoint test failed: ${httpErr.message}. Trying callable function...`, 'warning');

          const testCloudinaryConnection = httpsCallable(functions, 'testCloudinaryConnection');
          const callableResult = await testCloudinaryConnection();
          result = callableResult.data;
        }
      } else {
        result = await cloudinaryService.testDirectConnection();
      }

      setTestResults(result);

      if (result.success) {
        setSuccessMessage(`${useServerSide ? 'Server' : 'Client'}-side connection successful to ${result.cloudName || 'Cloudinary'}`);
        addLog(
          `${useServerSide ? 'Server' : 'Client'}-side connection successful to ${result.cloudName || 'Cloudinary'}`,
          'success'
        );
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (err) {
      setError(`${useServerSide ? 'Server' : 'Client'}-side API test failed: ${err.message}`);
      addLog(`Error: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    addLog(`File selected: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setPhoto(dataUrl);

      fetch(dataUrl)
        .then(res => res.blob())
        .then(blob => {
          setPhotoBlob(blob);
          addLog(`File converted to blob: ${blob.size} bytes`);
        })
        .catch(err => {
          setError(`Failed to process image: ${err.message}`);
          addLog(`Error processing image: ${err.message}`, 'error');
        });
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!photoBlob) {
      setError('No photo to upload');
      addLog('Upload attempted with no photo', 'error');
      return;
    }

    addLog(`Starting ${useServerSide ? 'server-side' : 'direct'} upload to Cloudinary...`);
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    setUploadProgress(0);

    try {
      if (!useServerSide) {
        const result = await cloudinaryService.uploadDirect(
          photo,
          'diagnostics',
          (progress) => setUploadProgress(progress)
        );

        if (result.success) {
          setSuccessMessage(`Direct upload successful: ${result.publicId}`);
          addLog(`Direct upload successful: ${result.publicId}`, 'success');
          setUploadedUrl(result.url);
          setUploadedPublicId(result.publicId);
        } else {
          throw new Error(result.error || 'Direct upload failed');
        }
      } else {
        const base64Image = await blobToBase64(photoBlob);

        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 3, 95));
        }, 300);

        const uploadFunction = httpsCallable(functions, 'uploadToCloudinary');
        const result = await uploadFunction({
          base64Image: base64Image,
          folder: 'diagnostics'
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (result.data?.success) {
          setSuccessMessage(`Server upload successful: ${result.data.publicId}`);
          addLog(`Server upload successful: ${result.data.publicId}`, 'success');
          setUploadedUrl(result.data.url);
          setUploadedPublicId(result.data.publicId);
        } else {
          throw new Error(result.data?.error || 'Server upload failed');
        }
      }
    } catch (err) {
      setError(`Upload failed: ${err.message}`);
      addLog(`Error: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteImage = async () => {
    if (!uploadedPublicId) {
      setError("No image to delete");
      addLog("No image to delete", "warning");
      return;
    }

    addLog('Deleting image via server-side function...');
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const deleteFromCloudinary = httpsCallable(functions, 'deleteFromCloudinary');
      const result = await deleteFromCloudinary({
        publicId: uploadedPublicId
      });

      if (result.data?.success) {
        setSuccessMessage('Image deleted successfully from Cloudinary');
        addLog('Image deleted successfully from Cloudinary', 'success');
        setUploadedUrl(null);
        setUploadedPublicId(null);
      } else {
        throw new Error(result.data?.error || 'Server delete failed');
      }
    } catch (err) {
      setError(`Delete failed: ${err.message}`);
      addLog(`Error: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPhoto(null);
    setPhotoBlob(null);
    setUploadedUrl(null);
    setUploadedPublicId(null);
    setError(null);
    setSuccessMessage(null);
    setUploadProgress(0);
    setTestResults(null);
    addLog('Test reset');
  };

  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const testWithSmallImage = async () => {
    addLog(`Testing with small sample image (${useServerSide ? 'server-side' : 'direct upload'})...`);
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Create a tiny 1x1 pixel test image
      const tinyImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
      addLog(`Created test image, length: ${tinyImage.length} chars`);
      
      // Set the image preview
      setPhoto(tinyImage);
      
      // Convert base64 to blob for consistency with regular uploads
      const response = await fetch(tinyImage);
      const blob = await response.blob();
      setPhotoBlob(blob);
      
      if (useServerSide) {
        // Server-side upload via Firebase function
        const uploadFunction = httpsCallable(functions, 'uploadToCloudinary');
        addLog('Calling uploadToCloudinary with tiny test image...');
        
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 5, 95));
        }, 300);
        
        const result = await uploadFunction({
          base64Image: tinyImage,
          folder: 'test'
        });
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        if (result.data && result.data.success) {
          setSuccessMessage(`Server upload successful: ${result.data.publicId}`);
          addLog(`Test successful! Image uploaded to ${result.data.url}`, 'success');
          setUploadedUrl(result.data.url);
          setUploadedPublicId(result.data.publicId);
        } else {
          throw new Error(result.data?.error || 'Server upload failed');
        }
      } else {
        // Direct upload to Cloudinary
        const result = await cloudinaryService.uploadDirect(
          tinyImage,
          'test',
          (progress) => setUploadProgress(progress)
        );
        
        if (result.success) {
          setSuccessMessage(`Direct upload successful: ${result.publicId}`);
          addLog(`Test successful! Image uploaded to ${result.url}`, 'success');
          setUploadedUrl(result.url);
          setUploadedPublicId(result.publicId);
        } else {
          throw new Error(result.error || 'Direct upload failed');
        }
      }
    } catch (err) {
      setError(`Test failed: ${err.message}`);
      addLog(`Test error: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cloudinary-diagnostics">
      <Link to="/diagnostics">← Back to Diagnostics</Link>
      <h1>Cloudinary API Diagnostics</h1>
      
      <div className="info-box">
        <p>
          <strong>Note:</strong> For camera testing, please use the{" "}
          <Link to="/diagnostics/camera">Camera Diagnostics</Link> component.
          This component focuses on testing the Cloudinary API with pre-selected images.
        </p>
      </div>

      <div className="section">
        <h2>API Connection Test</h2>
        
        <div className="toggle-container" style={{ marginBottom: '20px' }}>
          <span className={`toggle-label ${!useServerSide ? 'active' : ''}`}>Client-side</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={useServerSide}
              onChange={() => setUseServerSide(!useServerSide)}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className={`toggle-label ${useServerSide ? 'active' : ''}`}>Server-side</span>
        </div>
        
        <div className="button-group">
          <button
            onClick={testApiConnection}
            className="primary-button"
            disabled={isLoading}
          >
            {isLoading ? 'Testing...' : `Test ${useServerSide ? 'Server' : 'Client'}-side Connection`}
          </button>
        </div>
        
        {testResults && (
          <div className={`result-box ${testResults.success ? 'success' : 'error'}`}>
            <h3>Test Results</h3>
            <pre>{JSON.stringify(testResults, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="section">
        <h2>Image Upload Test</h2>
        
        <div className="toggle-container" style={{ marginBottom: '20px' }}>
          <span className={`toggle-label ${!useServerSide ? 'active' : ''}`}>Direct to Cloudinary</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={useServerSide}
              onChange={() => setUseServerSide(!useServerSide)}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className={`toggle-label ${useServerSide ? 'active' : ''}`}>Via Firebase Function</span>
        </div>
        
        {!photo ? (
          <div className="image-capture-options">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="secondary-button"
            >
              Select Image File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <button
              onClick={testWithSmallImage}
              className="secondary-button"
              disabled={isLoading}
            >
              Test With Small Image
            </button>
          </div>
        ) : (
          <div className="image-preview">
            {uploadedUrl ? (
              <div className="upload-result">
                <h3>Upload Successful!</h3>
                <img src={uploadedUrl} alt="Uploaded" />
                <p>URL: <input type="text" readOnly value={uploadedUrl} /></p>
                <p>Public ID: <input type="text" readOnly value={uploadedPublicId || ''} /></p>
                
                <div className="action-buttons">
                  <button
                    onClick={handleReset}
                    className="secondary-button"
                  >
                    Test Another Image
                  </button>
                  <button
                    onClick={deleteImage}
                    className="warning-button"
                    disabled={isLoading || !uploadedPublicId}
                  >
                    {isLoading ? 'Deleting...' : 'Delete Image'}
                  </button>
                </div>
                <div className="note-box">
                  <strong>Note:</strong> Image deletion is always performed via server-side function for authentication security.
                </div>
              </div>
            ) : (
              <div className="upload-options">
                <div className="preview-container">
                  <img src={photo} alt="Preview" />
                </div>
                <div className="action-buttons">
                  <button
                    onClick={handleReset}
                    className="secondary-button"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    className="primary-button"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? `Uploading... ${uploadProgress}%`
                      : `Upload via ${useServerSide ? 'Server' : 'Direct'}`}
                  </button>
                </div>
                {isLoading && (
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="message error">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {successMessage && (
        <div className="message success">
          <strong>Success:</strong> {successMessage}
        </div>
      )}

      <div className="section">
        <div className="log-header">
          <h2>API Log</h2>
          {logMessages.length > 0 && (
            <button
              onClick={() => setLogMessages([])}
              className="small-button"
            >
              Clear Log
            </button>
          )}
        </div>
        <div className="log-container">
          {logMessages.map((log, index) => (
            <div
              key={index}
              className={`log-entry ${log.type}`}
            >
              [{log.timestamp}] {log.message}
            </div>
          ))}
          {logMessages.length === 0 && (
            <div className="log-empty">No logs available</div>
          )}
        </div>
      </div>

      <style jsx>{`
        .cloudinary-diagnostics {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .info-box {
          background-color: #e3f2fd;
          border: 1px solid #90caf9;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          color: #0d47a1;
        }
        .button-group {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }
        .section {
          margin-bottom: 30px;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .toggle-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin: 15px 0;
        }
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 60px;
          height: 30px;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 34px;
        }
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 22px;
          width: 22px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        input:checked + .toggle-slider {
          background-color: #2196F3;
        }
        input:checked + .toggle-slider:before {
          transform: translateX(30px);
        }
        .toggle-label {
          color: #666;
          font-weight: 500;
        }
        .toggle-label.active {
          color: #2196F3;
          font-weight: bold;
        }
        .primary-button {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 12px 20px;
          font-size: 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        .primary-button:hover {
          background: #45a049;
        }
        .primary-button:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }
        .secondary-button {
          background: #2196F3;
          color: white;
          border: none;
          padding: 10px 15px;
          font-size: 14px;
          border-radius: 4px;
          cursor: pointer;
        }
        .secondary-button:hover {
          background: #0b7dda;
        }
        .warning-button {
          background: #f44336;
          color: white;
          border: none;
          padding: 10px 15px;
          font-size: 14px;
          border-radius: 4px;
          cursor: pointer;
        }
        .warning-button:hover {
          background: #d32f2f;
        }
        .warning-button:disabled {
          background: #ffcdd2;
          cursor: not-allowed;
        }
        .small-button {
          background: #f44336;
          color: white;
          border: none;
          padding: 5px 10px;
          font-size: 12px;
          border-radius: 4px;
          cursor: pointer;
        }
        .result-box {
          margin-top: 20px;
          padding: 15px;
          border-radius: 4px;
        }
        .result-box.success {
          background: #e8f5e9;
          border: 1px solid #a5d6a7;
        }
        .result-box.error {
          background: #ffebee;
          border: 1px solid #ef9a9a;
        }
        .result-box pre {
          white-space: pre-wrap;
          background: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          font-size: 14px;
        }
        .image-capture-options {
          display: flex;
          gap: 15px;
          justify-content: center;
          margin: 20px 0;
        }
        .image-preview {
          margin: 20px 0;
        }
        .upload-result {
          text-align: center;
        }
        .upload-result img {
          max-width: 100%;
          max-height: 400px;
          border-radius: 8px;
          margin: 15px 0;
        }
        .upload-result input {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          margin-top: 5px;
        }
        .upload-options {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .preview-container {
          margin-bottom: 15px;
          max-width: 300px;
          max-height: 300px;
          overflow: hidden;
          border-radius: 8px;
        }
        .preview-container img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .action-buttons {
          display: flex;
          gap: 10px;
          margin: 15px 0;
        }
        .progress-bar-container {
          width: 100%;
          background-color: #f3f3f3;
          border-radius: 13px;
          margin: 10px 0;
          overflow: hidden;
        }
        .progress-bar {
          height: 10px;
          background-color: #4CAF50;
          border-radius: 10px;
          transition: width 0.3s ease;
        }
        .log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .log-container {
          height: 200px;
          overflow-y: auto;
          background: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 14px;
          border: 1px solid #ddd;
        }
        .log-entry {
          margin-bottom: 5px;
          padding-bottom: 3px;
          border-bottom: 1px dashed #ddd;
        }
        .log-entry.error {
          color: #c62828;
        }
        .log-entry.success {
          color: #2e7d32;
        }
        .log-entry.warning {
          color: #ef6c00;
        }
        .log-empty {
          color: #757575;
          font-style: italic;
          text-align: center;
          padding: 20px;
        }
        .message {
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 20px;
        }
        .message.error {
          background: #ffebee;
          border: 1px solid #ffcdd2;
          color: #c62828;
        }
        .message.success {
          background: #e8f5e9;
          border: 1px solid #c8e6c9;
          color: #2e7d32;
        }
        .note-box {
          background: #fff3e0;
          border: 1px solid #ffe0b2;
          border-radius: 4px;
          padding: 10px;
          margin: 10px 0;
          font-size: 14px;
          color: #e65100;
        }
      `}</style>
    </div>
  );
};

export default CloudinaryDiagnostics;
