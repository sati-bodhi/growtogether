import React, { useEffect } from "react";
import Webcam from "react-webcam";
import useCamera from "../hooks/useCamera";

const WebCameraModal = ({ isOpen, onClose, onCapture }) => {
  const {
    webcamRef,
    capturePhoto,
    toggleFacingMode,
    videoConstraints,
    error,
    initializeCamera,
    releaseCamera,
    isCameraActive
  } = useCamera();

  useEffect(() => {
    // Initialize camera when modal opens
    if (isOpen && !isCameraActive) {
      initializeCamera();
    }

    // Clean up function to release camera when modal closes
    return () => {
      if (isOpen) {
        releaseCamera();
      }
    };
  }, [isOpen, initializeCamera, releaseCamera, isCameraActive]);

  if (!isOpen) return null;

  const handleCapture = () => {
    const photoData = capturePhoto();
    if (photoData) {
      onCapture(photoData);
      onClose();
    }
  };

  return (
    <div className="webcam-modal">
      <div className="webcam-container">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          playsInline={true}
        />

        <div className="controls">
          <button className="switch-camera" onClick={toggleFacingMode}>
            Switch Camera
          </button>
          <button className="capture" onClick={handleCapture}>
            Capture
          </button>
          <button className="close" onClick={onClose}>
            Close
          </button>
        </div>

        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
};

export default WebCameraModal;
