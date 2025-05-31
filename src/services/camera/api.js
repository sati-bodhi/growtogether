/**
 * Mock implementation of Cloudinary upload API
 * Will be replaced with actual Cloudinary implementation later
 */
export const uploadImage = async (imageBlob, path = "images") => {
  try {
    console.log(`[MOCK] Uploading image to Cloudinary path: ${path}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create a local object URL for testing
    const localUrl = URL.createObjectURL(imageBlob);
    console.log(`[MOCK] Created local URL: ${localUrl}`);
    
    // In real implementation, this would return a Cloudinary URL
    return localUrl;
  } catch (error) {
    console.error("Error in mock upload:", error);
    throw new Error(`Mock upload failed: ${error.message}`);
  }
};

/**
 * Mock implementation for saving image metadata
 * Will be replaced with actual implementation later
 */
export const saveImageMetadata = async (data) => {
  try {
    console.log("[MOCK] Saving image metadata:", data);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate mock ID
    const mockId = `mock_${Date.now()}`;
    return mockId;
  } catch (error) {
    console.error("Error saving image metadata:", error);
    throw new Error(`Failed to save metadata: ${error.message}`);
  }
};
