import React from "react";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  image: {
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
  button: {
    padding: "10px 20px",
    borderRadius: "20px",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
  },
  primaryButton: {
    background: "#4285F4",
    color: "white",
  },
  secondaryButton: {
    background: "#6c757d",
    color: "white",
  },
  progressContainer: {
    width: "100%",
    maxWidth: "500px",
    marginTop: "15px",
    background: "#eee",
    borderRadius: "20px",
    overflow: "hidden",
  },
  progressBar: {
    height: "10px",
    background: "#4CAF50",
    borderRadius: "20px",
    transition: "width 0.3s ease",
  },
  error: {
    padding: "10px",
    background: "#f8d7da",
    color: "#721c24",
    borderRadius: "8px",
    marginTop: "10px",
    maxWidth: "500px",
    width: "100%",
  }
};

const ImagePreview = ({ 
  photo, 
  isLoading, 
  error, 
  uploadProgress, 
  onUpload, 
  onRetake 
}) => {
  return (
    <div style={styles.container}>
      {photo && (
        <img src={photo} alt="Captured" style={styles.image} />
      )}

      {error && (
        <div style={styles.error}>{error}</div>
      )}

      {isLoading && (
        <div style={styles.progressContainer}>
          <div 
            style={{
              ...styles.progressBar,
              width: `${uploadProgress}%`
            }}
          />
          <div style={{ textAlign: "center", margin: "5px 0" }}>
            Uploading: {uploadProgress}%
          </div>
        </div>
      )}

      <div style={styles.buttonContainer}>
        <button 
          style={{...styles.button, ...styles.secondaryButton}} 
          onClick={onRetake}
          disabled={isLoading}
        >
          Retake
        </button>
        <button 
          style={{...styles.button, ...styles.primaryButton}} 
          onClick={onUpload}
          disabled={isLoading || !photo}
        >
          {isLoading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
};

export default ImagePreview;
