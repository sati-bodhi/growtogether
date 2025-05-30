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

## Firebase Emulator Usage
For local development, use Firebase emulators:

```bash
firebase emulators:start
```

Configure the application to use emulators by setting appropriate environment variables in `.env.local`:

```
REACT_APP_USE_EMULATORS=true
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
