import React, { useCallback, useState, useEffect } from "react";
import Webcam from "react-webcam";

const WebcamCapture = ({ webcamRef, videoConstraints, onCapture, toggleFacingMode }) => {
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const mobileStyles = {
    container: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      zIndex: 1000,
      background: "#000",
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
      zIndex: 1001
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
      zIndex: 1001,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    closeButton: {
      position: "absolute",
      top: "20px",
      left: "20px",
      zIndex: 1001,
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
  
  const desktopStyles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    webcam: {
      width: "100%",
      maxWidth: "500px",
      borderRadius: "8px",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "space-around",
      width: "100%",
      maxWidth: "500px",
      marginTop: "15px",
    },
    captureButton: {
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      background: "#e74c3c",
      border: "3px solid white",
      cursor: "pointer",
    },
    switchButton: {
      padding: "10px",
      borderRadius: "50%",
      background: "rgba(0,0,0,0.5)",
      color: "white",
      border: "none",
      position: "absolute", 
      top: "10px",
      right: "10px",
      cursor: "pointer",
    }
  };

  const styles = isMobile ? mobileStyles : desktopStyles;
  
  return (
    <div style={styles.container}>
      <div style={{ position: "relative", width: "100%", height: isMobile ? "100%" : "auto" }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          style={styles.webcam}
          playsInline={true}
          forceScreenshotSourceSize
          mirrored={videoConstraints.facingMode === "user"}
        />
        
        {isMobile && (
          <button style={styles.closeButton} onClick={() => window.history.back()}>
            ✕
          </button>
        )}
        
        <button 
          style={styles.switchButton}
          onClick={toggleFacingMode}
          title="Switch Camera"
        >
          🔄
        </button>
      </div>

      <div style={styles.buttonContainer}>
        <button
          style={styles.captureButton}
          onClick={onCapture}
        />
      </div>
    </div>
  );
};

export default WebcamCapture;
