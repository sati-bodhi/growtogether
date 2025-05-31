# Camera Service Documentation

## Overview

The camera service provides a flexible way to capture and manage images within the application. It supports both web-based camera access and native device camera interfaces, selecting the optimal one based on the device and user preferences.

## Architecture

The service follows a modular architecture with clear separation of concerns:

```sh
services/camera/
├── components/               # UI components
│   ├── WebcamCapture.jsx     # Web camera implementation
│   ├── NativeCamera.jsx      # Native device camera implementation
│   ├── ImagePreview.jsx      # Image display and management
│   ├── CameraSelector.jsx    # Smart component to choose camera type
│   └── WebCameraModal.jsx    # Modal implementation of webcam
├── hooks/
│   └── useCamera.js          # Core camera functionality hook
├── api.js                    # API for image upload and metadata
└── index.js                  # Public exports
```

## Key Features

- **Adaptive Camera Interface**: Automatically selects between web and native camera based on device type
- **User Preferences**: Remembers user's camera preference
- **Front/Rear Camera Switching**: Supports toggling between front and rear cameras
- **Image Capture**: Takes photos and converts to usable formats
- **Image Preview**: Displays captured images with options to retake or upload
- **Upload Functionality**: Uploads images to storage (Cloudinary in production)
- **Progress Tracking**: Shows upload progress to users
- **Error Handling**: Comprehensive error states and messaging

## How to Use

### Basic Usage

```jsx
import { WebcamCapture, ImagePreview, useCamera } from '../services/camera';

function MyComponent() {
  const {
    webcamRef,
    photo,
    capturePhoto,
    resetPhoto,
    uploadPhoto,
    isLoading,
    error,
    uploadProgress,
  } = useCamera();

  const handleCapture = () => {
    capturePhoto();
  };

  const handleUpload = () => {
    uploadPhoto('observations');
  };

  return (
    <div>
      {!photo ? (
        <WebcamCapture 
          webcamRef={webcamRef}
          videoConstraints={{ facingMode: 'environment' }}
          onCapture={handleCapture}
        />
      ) : (
        <ImagePreview
          photo={photo}
          isLoading={isLoading}
          error={error}
          uploadProgress={uploadProgress}
          onUpload={handleUpload}
          onRetake={resetPhoto}
        />
      )}
    </div>
  );
}
```

### With Automatic Camera Selection

```jsx
import { CameraSelector, ImagePreview, useCamera } from '../services/camera';

function SmartCameraComponent() {
  const camera = useCamera();
  
  return (
    <div>
      {!camera.photo ? (
        <CameraSelector 
          onCapture={camera.capturePhoto}
          webcamRef={camera.webcamRef}
          videoConstraints={camera.videoConstraints}
          toggleFacingMode={camera.toggleFacingMode}
        />
      ) : (
        <ImagePreview
          photo={camera.photo}
          isLoading={camera.isLoading}
          error={camera.error}
          uploadProgress={camera.uploadProgress}
          onUpload={() => camera.uploadPhoto('observations')}
          onRetake={camera.resetPhoto}
        />
      )}
    </div>
  );
}
```

## Implementation Details

### useCamera Hook

The `useCamera` hook handles all camera operations including:

- Initializing camera stream
- Capturing photos
- Converting between formats (data URL, Blob)
- Uploading to storage
- Managing loading and error states
- Tracking upload progress

### Image Upload

Currently using a mock implementation that simulates Cloudinary uploads. The actual implementation will connect to Cloudinary using the credentials from environment variables:

- `REACT_APP_CLOUDINARY_CLOUD_NAME`
- `REACT_APP_CLOUDINARY_UPLOAD_PRESET`

### Mobile Optimizations

- On mobile devices, the UI adjusts for touch interfaces
- Full-screen camera view for better user experience
- Optimized image sizing and compression
- Specific handling for iOS devices

## Future Enhancements

- Implement actual Cloudinary integration
- Offline support for image capture and queued uploads
- Add PlantNet API integration for plant identification
