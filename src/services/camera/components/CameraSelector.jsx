import React, { useState, useEffect } from 'react';
import WebcamCapture from './WebcamCapture';
import NativeCamera from './NativeCamera';

const CameraSelector = (props) => {
  const [useMobileNativeCamera, setUseMobileNativeCamera] = useState(false);
  
  // You can add a toggle to let users choose
  const toggleCameraType = () => {
    setUseMobileNativeCamera(prev => !prev);
    localStorage.setItem('useNativeCamera', !useMobileNativeCamera);
  };
  
  useEffect(() => {
    // Check user preference
    const savedPref = localStorage.getItem('useNativeCamera');
    if (savedPref !== null) {
      setUseMobileNativeCamera(savedPref === 'true');
    } else {
      // Auto-detect iOS for best experience
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      setUseMobileNativeCamera(isIOS);
    }
  }, []);
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  if (isMobile && useMobileNativeCamera) {
    return <NativeCamera {...props} />;
  } else {
    return <WebcamCapture {...props} />;
  }
};

export default CameraSelector;