import React, { useCallback } from "react";
import Webcam from "react-webcam";

const styles = {
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

const WebcamCapture = ({ webcamRef, videoConstraints, onCapture, toggleFacingMode }) => {
  const handleCapture = useCallback(() => {
    if (onCapture) onCapture();
  }, [onCapture]);

  return (
    <div style={styles.container}>
      <div style={{ position: "relative", width: "100%", maxWidth: "500px" }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          style={styles.webcam}
        />
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
          onClick={handleCapture}
        />
      </div>
    </div>
  );
};

export default WebcamCapture;
