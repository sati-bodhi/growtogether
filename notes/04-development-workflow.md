# Development Workflow

## Feature Development Process

1. **Plan Feature**
   - Define data model
   - Identify component requirements
   - Plan API functions

2. **Implement API Layer**
   - Create feature/api/index.js with core CRUD operations
   - Test in isolation using Firebase console

3. **Create Diagnostic Test Page**
   - Add to diagnostics/features/[FeatureName]Diagnostics.jsx
   - Implement minimal UI to test API functions

4. **Develop Core Components**
   - Build UI components in feature/components/
   - Test components in diagnostic page

5. **Create Custom Hooks**
   - Implement hooks in feature/hooks/
   - Refactor diagnostic page to use hooks

6. **Build Feature Page**
   - Create production page using components and hooks
   - Add to main application routing

7. **Integration Testing**
   - Test feature in the context of the full application
   - Verify interactions with other features

## Diagnostic System Usage

The diagnostic system allows testing features in isolation. Access it:

- In development: http://localhost:3000/diagnostics
- In production: Press Ctrl+Shift+D to enable, then navigate to /diagnostics

## Environment Configuration

We use a simplified approach to manage development and production environments:

### Environment Setup

- **Development**: Uses local Firebase emulators
- **Staging**: Points to production Firebase but for testing purposes
- **Production**: Full production environment

### Configuration Structure

- Environment variables in `.env.local` (gitignored) store credentials/secrets
- Environment switching handled via npm scripts that set `REACT_APP_ENV`
- No need for multiple `.env` files since scripts set the environment

### Configuration File

```jsx
// src/config/environment.js
const environments = {
  development: {
    useEmulators: true,
    projectId: 'blng-beda9'
  },
  staging: {
    useEmulators: false,
    projectId: 'blng-beda9'
  },
  production: {
    useEmulators: false,
    projectId: 'blng-beda9'
  }
};

// Default to development
const ENV = process.env.REACT_APP_ENV || 'development';

export default environments[ENV];
```

## Firebase Emulator Usage

For local development, use Firebase emulators:

```bash
# Start the emulators
npm run emulators
# or directly:
firebase emulators:start
```

Our Firebase service initializes automatically based on the environment:

```jsx
// src/services/firebase.js
import env from '../config/environment';

// Firebase initialization code...

// Connect to emulators automatically in development
if (env.useEmulators) {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFunctionsEmulator(functions, 'localhost', 5001);
  console.log('Using Firebase emulators');
}
```

## Environment Scripts

```json
"scripts": {
  "start": "REACT_APP_ENV=development react-scripts start",
  "start:prod": "REACT_APP_ENV=staging react-scripts start",
  "build": "REACT_APP_ENV=production react-scripts build",
  "emulators": "firebase emulators:start"
}
```

## Testing Features in Production

To test features in the production environment before full release:

1. Run app in staging mode: `npm run start:prod`
2. Use feature flags to control visibility of new features
3. Or add query parameters for testing: `https://your-app.com?NEW_FEATURE=true`

## Feature Flag System

The feature flag system allows conditional rendering of features based on environment or URL parameters:

```jsx
// src/features/featureFlags.jsx
import React from 'react';
import env from '../config/environment';

// Feature flags based on environment
const FEATURE_FLAGS = {
  NEW_GARDEN_UI: env.ENV !== 'production',  // Only in dev/staging
  ENHANCED_CAMERA: false,                   // Disabled everywhere
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

// React component to conditionally render features
export const FeatureFlag = ({ feature, children, fallback = null }) => {
  if (FEATURE_FLAGS[feature]) {
    return <>{children}</>;
  }
  return fallback;
};
```

### Usage Example:

```jsx
import { FeatureFlag } from '../features/featureFlags';

function GardenPage() {
  return (
    <div>
      {/* Regular UI everyone sees */}
      <h1>Your Gardens</h1>
      
      {/* New UI only in development/staging by default */}
      <FeatureFlag feature="NEW_GARDEN_UI">
        <NewGardenInterface />
      </FeatureFlag>
      
      {/* With fallback for disabled features */}
      <FeatureFlag 
        feature="ENHANCED_CAMERA" 
        fallback={<BasicCameraInterface />}
      >
        <AdvancedCameraInterface />
      </FeatureFlag>
    </div>
  );
}
```

## Code Quality Standards

- **Components**: Follow functional component pattern with hooks
- **State Management**: Use React Context for shared state
- **Error Handling**: Consistent error handling in API functions
- **Documentation**: JSDoc comments for functions and components
- **Testing**: Test each feature independently before integration

## Git Workflow

- Main branch: Production-ready code
- Development branch: Integration of features
- Feature branches: Individual feature development
