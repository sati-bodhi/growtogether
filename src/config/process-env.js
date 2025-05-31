// Polyfill for process.env in browser
if (typeof window !== 'undefined' && !window.process) {
  window.process = {
    env: {
      NODE_ENV: process.env.NODE_ENV || 'development',
      REACT_APP_ENV: process.env.REACT_APP_ENV || 'development',
      // Add other environment variables you need access to:
      REACT_APP_CLOUDINARY_CLOUD_NAME: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
      REACT_APP_CLOUDINARY_UPLOAD_PRESET: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
    }
  };
}

export default window.process;