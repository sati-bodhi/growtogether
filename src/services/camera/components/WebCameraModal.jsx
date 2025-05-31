import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import Webcam from "react-webcam";
import useCamera from "../hooks/useCamera";

const WebCameraModal = ({ isOpen, onClose, onCapture }) => {
  const camera = useCamera();
  const [cameraError, setCameraError] = useState(null);

  useEffect(() => {
    if (isOpen && !camera.isCameraActive) {
      try {
        // Add a small delay to ensure any previous camera sessions are fully closed
        setTimeout(() => {
          camera.initializeCamera().catch(err => {
            console.error("Camera initialization error:", err);
            setCameraError("Failed to access camera. Please check permissions and try again.");
          });
        }, 300);
      } catch (err) {
        console.error("Camera initialization error:", err);
        setCameraError("Failed to access camera. Please check permissions and try again.");
      }
    }

    // Lock body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      if (camera.isCameraActive) {
        camera.releaseCamera();
      }
      // Restore scroll when modal closes
      document.body.style.overflow = "";
    };
  }, [isOpen, camera]);

  if (!isOpen) return null;

  const handleCapture = () => {
    const photoData = camera.capturePhoto();
    if (photoData) {
      onCapture(photoData);
      onClose();
    }
  };

  const modalStyles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: "100vw",
      height: "100vh",
      zIndex: 2147483647,
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
      zIndex: 2147483648
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
      zIndex: 2147483648,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    closeButton: {
      position: "absolute",
      top: "20px",
      left: "20px",
      zIndex: 2147483648,
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
    },
    errorMessage: {
      position: "absolute",
      bottom: "100px", 
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(255,0,0,0.7)",
      color: "white",
      padding: "12px 20px",
      borderRadius: "8px",
      textAlign: "center",
      maxWidth: "80%",
      zIndex: 2147483648
    }
  };

  // Use portal to render modal at the body level
  const modal = (
    <div style={modalStyles.overlay}>
      {!cameraError && (
        <Webcam
          audio={false}
          ref={camera.webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={camera.videoConstraints}
          style={modalStyles.webcam}
          mirrored={camera.videoConstraints.facingMode === "user"}
          playsInline={true}
          autoPlay={true}
          muted={true}
          forceScreenshotSourceSize={true}
          onUserMediaError={(err) => {
            console.error("Media error:", err);
            setCameraError("Failed to access camera. Please check permissions and try again.");
          }}
        />
      )}
      
      {cameraError && (
        <div style={modalStyles.errorMessage}>
          {cameraError}
        </div>
      )}
      
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
          disabled={!!cameraError}
        />
      </div>
    </div>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default WebCameraModal;
