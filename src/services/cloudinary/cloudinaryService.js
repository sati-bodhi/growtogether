import { isFeatureEnabled } from '../../features/featureFlag';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';

/**
 * Get Cloudinary configuration from environment variables
 * @returns {Object} Cloudinary configuration
 */
const getCloudinaryConfig = () => {
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'gardenlog';
  
  if (!cloudName) {
    console.warn('Cloudinary configuration not found. Check environment variables.');
    return null;
  }
  
  return { cloudName, uploadPreset };
};

/**
 * Upload directly to Cloudinary (client-side)
 * @param {Blob} imageBlob - The image blob to upload
 * @param {string} folder - Folder path in Cloudinary
 * @param {string} uploadPreset - The upload preset to use
 * @param {Function} progressCallback - Callback for upload progress updates
 * @returns {Promise<string>} The URL of the uploaded image
 */
const directCloudinaryUpload = async (imageBlob, folder, uploadPreset, progressCallback) => {
  const { cloudName } = getCloudinaryConfig();
  
  // Create form data for upload
  const formData = new FormData();
  formData.append('file', imageBlob);
  formData.append('upload_preset', uploadPreset);
  
  if (folder) {
    formData.append('folder', folder);
  }
  
  try {
    // Create XMLHttpRequest to track progress
    return await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Setup progress tracking
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          progressCallback(percentComplete);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          resolve(response.secure_url);
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      };
      
      xhr.onerror = () => reject(new Error('Network error during upload'));
      
      // Open connection and send data
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/upload`);
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Direct Cloudinary upload error:', error);
    throw new Error(`Failed to upload directly to Cloudinary: ${error.message}`);
  }
};

/**
 * Upload to Cloudinary via Firebase function proxy (server-side)
 * @param {Blob} imageBlob - The image blob to upload
 * @param {string} folder - Folder path in Cloudinary
 * @param {string} uploadPreset - The upload preset to use
 * @param {Function} progressCallback - Callback for upload progress updates
 * @returns {Promise<string>} The URL of the uploaded image
 */
const proxyCloudinaryUpload = async (imageBlob, folder, uploadPreset, progressCallback) => {
  try {
    // Convert blob to base64
    const base64Image = await blobToBase64(imageBlob);
    
    // Get the Firebase Functions instance
    const functions = getFunctions();
    if (process.env.NODE_ENV === 'development') {
      connectFunctionsEmulator(functions, "localhost", 5001);
    }
    
    // Create a callable function reference
    const uploadToCloudinary = httpsCallable(functions, 'uploadToCloudinary');
    
    // Since callable functions don't support progress tracking, we'll simulate it
    progressCallback(10);
    
    // Call the function
    const result = await uploadToCloudinary({
      base64Image,
      folder,
      uploadPreset
    });
    
    progressCallback(100);
    
    // Return the URL from the result data
    return result.data.url;
  } catch (error) {
    console.error('Proxy Cloudinary upload error:', error);
    throw new Error(`Failed to upload via proxy: ${error.message}`);
  }
};

// Helper function to convert Blob to base64
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Upload image to Cloudinary - chooses method based on feature flags
 * @param {Blob} imageBlob - The image blob to upload
 * @param {string} folder - Folder path in Cloudinary
 * @param {Function} progressCallback - Callback for upload progress updates
 * @returns {Promise<string>} The URL of the uploaded image
 */
export const uploadToCloudinary = async (imageBlob, folder = '', progressCallback = () => {}) => {
  try {
    const config = getCloudinaryConfig();
    
    if (!config) {
      throw new Error('Cloudinary configuration is missing');
    }
    
    const { uploadPreset } = config;
    
    // Use server-side proxy by default, direct upload only if explicitly enabled
    const useDirectUpload = isFeatureEnabled('USE_DIRECT_CLOUDINARY');
    
    console.log(`Uploading to Cloudinary using ${useDirectUpload ? 'direct' : 'proxy'} method`);
    
    if (useDirectUpload) {
      return await directCloudinaryUpload(imageBlob, folder, uploadPreset, progressCallback);
    } else {
      return await proxyCloudinaryUpload(imageBlob, folder, uploadPreset, progressCallback);
    }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw new Error(`Upload failed: ${error.message}`);
  }
};

/**
 * Generate a unique path for image upload
 * @param {string} basePath - The base path/folder
 * @returns {string} The unique path including timestamp
 */
export const generateUploadPath = (basePath = 'images') => {
  const timestamp = new Date().getTime();
  return `${basePath}/${timestamp}`;
};

/**
 * Optimize image before upload (resize/compress)
 * @param {Blob} imageBlob - Original image blob
 * @param {Object} options - Optimization options
 * @returns {Promise<Blob>} Optimized image blob
 */
export const optimizeImage = async (imageBlob, options = {}) => {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.85 } = options;
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate dimensions, maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        
        // Set canvas dimensions and draw image
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with quality setting
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          },
          imageBlob.type,
          quality
        );
      } catch (err) {
        reject(new Error(`Image optimization failed: ${err.message}`));
      }
    };
    
    img.onerror = () => reject(new Error('Failed to load image for optimization'));
    
    // Create object URL from blob
    img.src = URL.createObjectURL(imageBlob);
  });
};

/**
 * Test Cloudinary API connection directly from the client
 * @returns {Promise<Object>} Connection test result
 */
const testDirectConnection = async () => {
  try {
    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
    
    if (!cloudName) {
      return {
        success: false,
        error: "Missing Cloudinary configuration (REACT_APP_CLOUDINARY_CLOUD_NAME)"
      };
    }
    
    // Use a simple GET request to a public resource instead of the API ping
    // This avoids CORS issues since public images allow cross-origin requests
    const response = await fetch(`https://res.cloudinary.com/${cloudName}/image/upload/sample.jpg`, {
      method: 'HEAD'  // Just check if resource exists without downloading it
    });
    
    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      cloudName,
      uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'gardenlog'
    };
  } catch (error) {
    console.error("Cloudinary direct connection test failed:", error);
    return {
      success: false,
      error: error.message || "Network error"
    };
  }
};

/**
 * Delete an image from Cloudinary directly from client
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} Deletion result
 */
const deleteDirectFromCloudinary = async (publicId) => {
  try {
    // Without API secret, we can only delete unsigned images through
    // a preset that allows deletion. This is a security limitation.
    // For most cases, deletion should go through server-side proxy.
    const { cloudName } = getCloudinaryConfig();
    
    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('api_key', process.env.REACT_APP_CLOUDINARY_API_KEY);
    
    // This will likely fail without a valid signature
    // Primarily here to demonstrate the API limitation
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    return {
      success: result.result === "ok",
      result: result
    };
  } catch (error) {
    console.error("Cloudinary direct deletion failed:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete an image via Firebase function proxy
 * @param {string} publicId - The public ID of the image to delete
 * @returns {Promise<Object>} Deletion result
 */
const deleteViaProxy = async (publicId) => {
  try {
    const functions = getFunctions();
    if (process.env.NODE_ENV === 'development') {
      connectFunctionsEmulator(functions, "127.0.0.1", 5001);
      console.log("Connected to Functions emulator for delete operation");
    }

    const deleteFromCloudinary = httpsCallable(functions, 'deleteFromCloudinary');
    console.log(`Calling deleteFromCloudinary with publicId: ${publicId}`);
    const result = await deleteFromCloudinary({ publicId });
    console.log("Delete result:", result.data);

    return result.data;
  } catch (error) {
    console.error("Proxy deletion error:", error);
    return {
      success: false,
      error: error.message || "Unknown error"
    };
  }
};

/**
 * Test server-side Cloudinary connection via Firebase function
 * @returns {Promise<Object>} Connection test result
 */
const testProxyConnection = async () => {
  try {
    const functions = getFunctions();
    if (process.env.NODE_ENV === 'development') {
      connectFunctionsEmulator(functions, "localhost", 5001);
    }
    const testConnection = httpsCallable(functions, 'testCloudinaryConnection');
    const result = await testConnection();
    return result.data;
  } catch (error) {
    console.error("Proxy connection test failed:", error);
    return { success: false, error: error.message };
  }
};

// Create a named object before exporting
const cloudinaryService = {
  uploadToCloudinary,
  generateUploadPath,
  optimizeImage,
  directCloudinaryUpload,
  proxyCloudinaryUpload,
  testDirectConnection,
  testProxyConnection,
  deleteDirectFromCloudinary,
  deleteViaProxy,
  uploadDirect: async (base64Image, folder = 'uploads', onProgress) => {
    try {
      const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'gardenlog';
      
      if (!cloudName) {
        throw new Error('Cloudinary cloud name not configured');
      }
      
      console.log(`Uploading image to ${cloudName} with preset ${uploadPreset}`);
      
      // Extract actual base64 data if it's a data URL
      let uploadData;
      if (base64Image.startsWith('data:')) {
        uploadData = base64Image;
      } else {
        uploadData = base64Image;
      }
      
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', uploadData);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', folder);
      
      // Upload to Cloudinary via fetch with progress reporting
      const xhr = new XMLHttpRequest();
      
      // Set up progress tracking
      if (onProgress && typeof onProgress === 'function') {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete);
          }
        };
      }
      
      // Create a promise to handle the XHR response
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, true);
        
        xhr.onload = function() {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve({
              success: true,
              publicId: response.public_id,
              url: response.secure_url,
              format: response.format,
              width: response.width,
              height: response.height
            });
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
          }
        };
        
        xhr.onerror = function() {
          reject(new Error('Network error during upload'));
        };
        
        xhr.send(formData);
      });
      
      return await uploadPromise;
    } catch (error) {
      console.error('Error in uploadDirect:', error);
      return {
        success: false,
        error: error.message || 'Upload failed'
      };
    }
  },
  deleteDirect: async (publicId) => {
    // This will likely need to be done via server as it requires API secret
    console.warn('Direct deletion from client requires special configuration/signing');
    return {
      success: false,
      error: 'Direct deletion from client is not supported without proper signing'
    };
  }
};

export default cloudinaryService;