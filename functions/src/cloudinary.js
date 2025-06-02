const cloudinary = require("cloudinary").v2;
const functions = require("firebase-functions");

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image to Cloudinary - adapted for callable function
 * @param {Object} data Request data containing base64 encoded image
 * @param {Object} context Firebase callable context
 * @return {Promise<Object>} Upload result with URL and metadata
 */
exports.uploadToCloudinary = async (data, context) => {
  console.log("uploadToCloudinary function called");
  
  // Extract the correct data object
  const payload = data.data || data;
  console.log("Received keys:", Object.keys(payload || {}));
  
  // Validate the base64Image parameter
  if (!payload || !payload.base64Image) {
    console.error("Missing base64Image parameter");
    throw new Error("Missing required parameter: base64Image");
  }
  
  try {
    const base64Image = payload.base64Image;
    console.log(`Image base64 length: ${base64Image.length}`);
    
    const folder = payload.folder || 'uploads';
    const fileName = payload.fileName || `upload_${Date.now()}`;
    
    console.log(`Uploading image to Cloudinary (folder: ${folder})`);
    
    // Upload to Cloudinary with explicit error handling
    try {
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: folder,
        public_id: fileName,
        resource_type: 'image'
      });
      
      console.log("Upload successful:", result.public_id);
      
      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height
      };
    } catch (uploadError) {
      console.error("Cloudinary upload error:", uploadError);
      return {
        success: false,
        error: uploadError.message || "Failed to upload to Cloudinary"
      };
    }
  } catch (error) {
    console.error("General error in uploadToCloudinary:", error);
    return {
      success: false,
      error: error.message || "Unknown error in upload function"
    };
  }
};

/**
 * Delete an image from Cloudinary
 * @param {Object} data Request data containing public_id
 * @param {Object} context Firebase callable context
 * @return {Promise<Object>} Deletion result
 */
exports.deleteFromCloudinary = async (data, context) => {
  console.log("deleteFromCloudinary function called");
  console.log("Received data:", data);
  
  // Extract the correct data object (similar to upload function)
  const payload = data.data || data;
  console.log("Payload keys:", Object.keys(payload || {}));
  
  try {
    if (!payload || !payload.publicId) {
      console.error("Missing publicId parameter in payload:", payload);
      throw new Error("Missing required parameter: publicId");
    }

    const publicId = payload.publicId;
    console.log(`Attempting to delete image with public_id: ${publicId}`);
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate: true
    });

    console.log("Delete result:", result);
    if (result.result === "ok") {
      return {
        success: true,
        message: "Image deleted successfully"
      };
    } else {
      return {
        success: false,
        error: `Deletion failed: ${result.result}`,
        details: result
      };
    }
  } catch (error) {
    console.error("Deletion error:", error);
    return {
      success: false,
      error: error.message || "Unknown deletion error",
      details: String(error)
    };
  }
};

/**
 * Test the Cloudinary API connection from the server
 * @return {Promise<Object>} Connection test result
 */
exports.testCloudinaryConnection = async (data, context) => {
  console.log("testCloudinaryConnection function called");
  try {
    console.log("Cloudinary Config:", {
      cloud_name: cloudinary.config().cloud_name || "NOT SET",
      api_key: cloudinary.config().api_key ? "PRESENT" : "NOT SET",
      api_secret: cloudinary.config().api_secret ? "PRESENT" : "NOT SET",
    });
    
    console.log("Environment:", {
      FIREBASE_CONFIG: process.env.FIREBASE_CONFIG ? "PRESENT" : "NOT SET",
      NODE_ENV: process.env.NODE_ENV
    });
    
    // Check if we have Cloudinary credentials
    if (!cloudinary.config().cloud_name || 
        !cloudinary.config().api_key || 
        !cloudinary.config().api_secret) {
      console.log("Missing Cloudinary credentials");
      return {
        success: false,
        error: "Cloudinary credentials not configured or incomplete"
      };
    }

    console.log("Attempting to ping Cloudinary API...");
    
    // Try a simple ping
    try {
      console.log("Cloudinary API ping starting...");
      const result = await cloudinary.api.ping();
      console.log("Cloudinary API ping success:", result);
      
      return {
        success: true,
        status: "connected",
        cloudName: cloudinary.config().cloud_name,
        message: "Successfully connected to Cloudinary API"
      };
    } catch (apiError) {
      console.error("Cloudinary API ping failed:", apiError);
      return {
        success: false,
        error: `API test failed: ${apiError.message}`
      };
    }
  } catch (error) {
    console.error("General error in testCloudinaryConnection:", error);
    return {
      success: false,
      error: error.message || "Unknown error"
    };
  }
};

/**
 * Test parameters function
 * @param {Object} data Request data
 * @param {Object} context Firebase callable context
 * @return {Promise<Object>} Test result
 */
exports.testParameters = async (data, context) => {
  console.log("testParameters function called with data:", data);
  return {
    success: true,
    receivedParameters: Object.keys(data || {}),
    hasBase64Image: data && data.base64Image ? true : false,
    base64ImageLength: data && data.base64Image ? data.base64Image.length : 0
  };
};
