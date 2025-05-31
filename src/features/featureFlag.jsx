import React from 'react';
import env from '../config/environment';

// Feature flags based on environment
const FEATURE_FLAGS = {
  // Original flags
  NEW_GARDEN_UI: env.ENV !== 'production',
  ENHANCED_CAMERA: false,
  BASIC_CAMERA: env.ENV !== 'production',
  IMAGE_OPTIMIZATION: true,
  USE_MOCK_UPLOADS: env.ENV === 'development',
  
  // New Cloudinary-specific flags
  USE_DIRECT_CLOUDINARY: false,  // Default to proxy upload for security
  CLOUDINARY_DEBUG: env.ENV !== 'production',  // Enable detailed logs in non-production
};

// Query parameter overrides for testing
if (typeof window !== 'undefined') {
  const params = new URLSearchParams(window.location.search);
  Object.keys(FEATURE_FLAGS).forEach(flag => {
    if (params.has(flag)) {
      FEATURE_FLAGS[flag] = params.get(flag) === 'true';
    }
  });
}

// Export flags for direct usage in non-React code
export const isFeatureEnabled = (feature) => {
  return !!FEATURE_FLAGS[feature];
};

// React component to conditionally render features
export const FeatureFlag = ({ feature, children, fallback = null }) => {
  if (FEATURE_FLAGS[feature]) {
    return <>{children}</>;
  }
  return fallback;
};

export default FEATURE_FLAGS;