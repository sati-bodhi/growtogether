const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require('cors')({origin: true});  // Import CORS

// Initialize Firebase
admin.initializeApp();

// Import cloudinary functions
const cloudinaryFunctions = require("./src/cloudinary");

// Add a test HTTP endpoint with CORS support (for debugging)
exports.testCloudinaryConnectionHttp = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      const result = await cloudinaryFunctions.testCloudinaryConnection();
      res.status(200).send(result);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });
});

// Keep your existing callable functions
exports.uploadToCloudinary = functions.https.onCall(
  cloudinaryFunctions.uploadToCloudinary
);

exports.deleteFromCloudinary = functions.https.onCall(
  cloudinaryFunctions.deleteFromCloudinary
);

exports.testCloudinaryConnection = functions.https.onCall(
  cloudinaryFunctions.testCloudinaryConnection
);

exports.testParameters = functions.https.onCall(
  cloudinaryFunctions.testParameters
);
