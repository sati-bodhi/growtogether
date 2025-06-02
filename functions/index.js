const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require('cors')({origin: true});
const express = require('express');  // Add this import

// Initialize Firebase
admin.initializeApp();

// Import cloudinary functions
const cloudinaryFunctions = require("./src/cloudinary");

// Create an Express app for Cloud Run container mode
const app = express();

// Use CORS middleware
app.use(cors);

// Add health check endpoint
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// Map your functions to Express endpoints
app.post('/testCloudinaryConnectionHttp', async (req, res) => {
  try {
    const result = await cloudinaryFunctions.testCloudinaryConnection();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Start the server when in Cloud Run (not in functions framework)
if (process.env.K_SERVICE) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

// HTTP endpoint with CORS (keep this for Firebase Functions environment)
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

// Export the Express app as a function
exports.api = functions.https.onRequest(app);
