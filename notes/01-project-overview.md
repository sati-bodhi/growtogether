# Grow Together - Project Overview

## Project Description

Grow Together is a collaborative gardening application that allows users to track gardens, plants, and observations. It enables community gardening with shared gardens, tasks, and observations.

## Core Features

- **Gardens Management**: Create, join and manage garden spaces
- **Plant Tracking**: Log and monitor plants within gardens
- **Observations**: Record garden/plant observations with photos and notes
- **Tasks**: Assign and track gardening tasks
- **User Collaboration**: Invite users to participate in gardens

## Technology Stack

- **Frontend**: React 19.1.0
- **Routing**: React Router 7.6.1
- **Backend**: Firebase
  - Firestore (Database)
  - Authentication
  - Cloud Functions
  - Hosting
  - Storage

## Project Structure

```bash
grow-together/
├── src/
│   ├── features/           # Domain-specific feature modules
│   │   ├── gardens/        # Gardens feature
│   │   ├── plants/         # Plants feature
│   │   ├── observations/   # Observations feature
│   │   ├── tasks/          # Tasks feature
│   │   ├── auth/           # Authentication feature
│   │   └── user/           # User profile feature
│   ├── services/           # Technical services
│   │   ├── camera/         # Camera functionality
│   │   ├── location/       # GPS and location services
│   │   ├── maps/           # Map visualization
│   │   ├── database/       # Database utilities
│   │   └── firebase.jsx    # Firebase configuration
│   ├── pages/              # Application pages/screens
│   ├── components/         # Shared UI components
│   ├── diagnostics/        # Feature testing tools
│   └── styles/             # Global styles
├── public/                 # Static assets
└── functions/              # Firebase Cloud Functions
