import React, { useEffect } from "react";
import Webcam from "react-webcam";
import useCamera from "../hooks/useCamera";

const WebCameraModal = ({ isOpen, onClose, onCapture }) => {
  const camera = useCamera();

  useEffect(() => {
    if (isOpen && !camera.isCameraActive) {
      camera.initializeCamera();
    }

    return () => {
      if (isOpen) {
        camera.releaseCamera();
      }
    };
  }, [isOpen, camera.initializeCamera, camera.releaseCamera, camera.isCameraActive]);

  if (!isOpen) return null;

  const handleCapture = () => {
    const photoData = camera.capturePhoto();
    if (photoData) {
      onCapture(photoData);
      onClose();
    }
  };

  // Define modal styles directly to ensure they're applied
  const modalStyles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: "100vw",
      height: "100vh",
      zIndex: 9999,
      backgroundColor: "#000",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center"
    },
    webcam: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    },
    buttonContainer: {
      position: "absolute",
      bottom: "30px",
      left: 0,
      right: 0,
      display: "flex",
      justifyContent: "center",
      zIndex: 10000
    },
    captureButton: {
      width: "70px",
      height: "70px",
      borderRadius: "50%",
      background: "#e74c3c",
      border: "4px solid white",
      cursor: "pointer",
      boxShadow: "0 2px 10px rgba(0,0,0,0.3)"
    },
    switchButton: {
      position: "absolute",
      top: "20px",
      right: "20px",
      width: "50px",
      height: "50px",
      borderRadius: "50%",
      background: "rgba(0,0,0,0.5)",
      border: "none",
      color: "white",
      fontSize: "20px",
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    closeButton: {
      position: "absolute",
      top: "20px",
      left: "20px",
      zIndex: 10000,
      background: "rgba(0,0,0,0.5)",
      color: "white",
      border: "none",
      borderRadius: "50%",
      width: "50px",
      height: "50px",
      fontSize: "20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  };

  return (
    <div style={modalStyles.overlay}>
      <Webcam
        audio={false}
        ref={camera.webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={camera.videoConstraints}
        style={modalStyles.webcam}
      />
      
      <button 
        style={modalStyles.closeButton}
        onClick={onClose}
      >
        ✕
      </button>
      
      <button 
        style={modalStyles.switchButton}
        onClick={camera.toggleFacingMode}
      >
        🔄
      </button>
      
      <div style={modalStyles.buttonContainer}>
        <button 
          style={modalStyles.captureButton}
          onClick={handleCapture}
        />
      </div>
    </div>
  );
};

export default WebCameraModal;
