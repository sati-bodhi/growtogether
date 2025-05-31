import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { uploadImage, saveImageMetadata } from "../api";

const useCamera = (options = {}) => {
  const webcamRef = useRef(null);
  const streamRef = useRef(null); // Change from useState to useRef
  const [photo, setPhoto] = useState(null);
  const [photoBlob, setPhotoBlob] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState(options.facingMode || "environment");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Detect browser environment
  const isMobile = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  // Adjust video constraints based on device type
  const videoConstraints = useMemo(() => ({
    width: isMobile ? { ideal: 640 } : { ideal: 1280 },
    height: isMobile ? { ideal: 480 } : { ideal: 720 },
    facingMode
  }), [facingMode, isMobile]);

  const initializeCamera = useCallback(async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false
      });

      streamRef.current = stream; // Use .current for refs
      setIsCameraActive(true);

      setTimeout(() => {
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;

          if (isMobile && webcamRef.current.video) {
            webcamRef.current.video.play().catch(e => console.log("Video play error:", e));
          }

          setIsLoading(false);
        } else {
          setError("Camera initialization failed - please try again");
        }
      }, 100);
    } catch (err) {
      setError(`Failed to access camera: ${err.message}`);
      setIsLoading(false);
    }
  }, [videoConstraints, isMobile]);

  const releaseCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraActive(false);
    }
  }, []); // No dependencies needed when using refs

  const toggleFacingMode = useCallback(() => {
    releaseCamera();
    setFacingMode(prevMode => prevMode === "user" ? "environment" : "user");
    setTimeout(() => {
      initializeCamera();
    }, 100);
  }, [releaseCamera, initializeCamera]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = useCallback(() => {
    if (!webcamRef.current) {
      setError("Camera not initialized");
      return null;
    }

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      setPhoto(imageSrc);
      
      // Convert data URL to blob
      fetch(imageSrc)
        .then(res => res.blob())
        .then(blob => setPhotoBlob(blob))
        .catch(err => {
          console.error("Error converting photo to blob:", err);
          setError("Failed to process photo");
        });
      
      return imageSrc;
    } catch (err) {
      console.error("Error capturing photo:", err);
      setError(`Failed to capture photo: ${err.message}`);
      return null;
    }
  }, [webcamRef]);

  const resetPhoto = useCallback(() => {
    setPhoto(null);
    setPhotoBlob(null);
    setUploadProgress(0);
    setUploadedImageUrl(null);
  }, []);

  const uploadPhoto = useCallback(async (path = "images", metadata = {}) => {
    if (!photoBlob) {
      setError("No photo to upload");
      return null;
    }

    setIsLoading(true);
    setUploadProgress(0);
    
    try {
      // Create a more realistic progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const increment = prev < 50 ? 10 : prev < 80 ? 5 : 2;
          return Math.min(prev + increment, 90);
        });
      }, 300);

      const url = await uploadImage(photoBlob, path);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadedImageUrl(url);
      
      await saveImageMetadata({
        imageUrl: url,
        capturedAt: new Date().toISOString(),
        path,
        metadata
      });

      setIsLoading(false);
      return url;
    } catch (err) {
      console.error("Upload error:", err);
      setError(`Failed to upload: ${err.message}`);
      setIsLoading(false);
      return null;
    }
  }, [photoBlob]);

  return {
    webcamRef,
    photo,
    photoBlob,
    isLoading,
    error,
    facingMode,
    videoConstraints,
    uploadProgress,
    uploadedImageUrl,
    capturePhoto,
    resetPhoto,
    toggleFacingMode,
    uploadPhoto,
    initializeCamera,
    releaseCamera,
    isCameraActive,
  };
};

export default useCamera;
