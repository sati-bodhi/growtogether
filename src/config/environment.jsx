// src/config/environment.js
const environments = {
  // Development with emulators
  development: {
    useEmulators: true,
    projectId: 'blng-beda9'
  },
  // Production testing
  staging: {
    useEmulators: false,
    projectId: 'blng-beda9'
  },
  // Full production
  production: {
    useEmulators: false,
    projectId: 'blng-beda9'
  }
};

// Default to development
const ENV = process.env.REACT_APP_ENV || 'development';

export default environments[ENV];