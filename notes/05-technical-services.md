# Technical Services Implementation

## Camera Service

Handles capturing and managing images for observations and plants.

**Components**:
- CameraCapture - UI for taking photos
- ImagePreview - Display and edit captured images

**Hooks**:
- useCamera - Access device camera and capture images
- useImageUpload - Upload images to storage

**Features**:
- Front/back camera switching
- Image preview and retake
- Upload to Firebase Storage
- Image compression

## Location Service

Provides GPS location functionality for gardens and observations.

**Hooks**:
- useLocation - Access current device location
- useLocationTracking - Track location changes

**Utilities**:
- geocodeAddress - Convert address to coordinates
- calculateDistance - Measure distance between points
- polygonUtils - Functions for garden boundary operations

## Maps Service

Visualizes location data on interactive maps.

**Components**:
- MapView - Core map component
- GardenBoundaryEditor - Define/edit garden boundaries
- LocationPicker - Select locations on map

**Hooks**:
- useMap - Map management and interactions
- useMapMarkers - Handle map markers

**Features**:
- Display gardens as polygons
- Show plant locations as markers
- Select locations for observations
- Draw garden boundaries

## Database Service

Provides utilities for database operations across features.

**Modules**:
- schema.js - Data structure definitions
- utils.js - Reusable database helpers
- seed.js - Development data generation
- migrations.js - Schema update helpers

**Features**:
- Batch operations
- Transactions
- Query builders
- Data validation

## Implementation Notes

### Camera Service

We'll use the MediaDevices API (getUserMedia) for camera access rather than relying on a third-party library. This provides better control and reduces dependencies.

### Maps Integration

We'll use Leaflet.js for maps functionality as it's lightweight and works well with React. We'll need to create React wrappers around the Leaflet API.

### Location Access

Location access will require explicit user permission. We should provide clear UI indicating when and why location is being accessed.

### Offline Support

For future consideration, we should implement offline capabilities using IndexedDB to cache data and sync when online.
