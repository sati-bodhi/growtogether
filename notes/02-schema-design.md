# Database Schema Design

## Collections

### users
User profiles and authentication information.

```typescript
{
  uid: string;              // From Firebase Auth
  displayName: string;
  email: string;
  photoURL?: string;        // Optional
  lastActive: Timestamp;
  role: string;             // "user" or "admin"
}
```

### gardens
Garden spaces that can contain plants and observations.

```typescript
{
  id: string;               // Document ID
  name: string;
  description: string;
  location: {
    type: string;           // Always "Polygon"
    coordinates: number[][][]; // [[[lng, lat], [lng, lat], ...]]
  };
  adminUsers: string[];     // Array of userIds
  createdBy: string;        // userId
  createdAt: Timestamp;
}
```

### userGardens
Many-to-many relationship between users and gardens.

```typescript
{
  id: string;               // Document ID
  userId: string;
  gardenId: string;
  role: string;             // "admin" or "member"
  joinedAt: Timestamp;
}
```

### plants

Plants tracked within gardens.

```typescript
{
  id: string;               // Document ID
  gardenId: string;
  name: string;
  species: string;
  variety?: string;         // Optional
  plantedDate: Timestamp;
  location?: {              // Optional
    lat: number;
    lng: number;
  };
  status: string;           // "active", "harvested", "removed"
  createdBy: string;
  createdAt: Timestamp;
}
```

### observations

Observations about gardens or plants.

```typescript
{
  id: string;               // Document ID
  gardenId: string;
  plantId?: string;         // Optional
  userId: string;
  location: {
    lat: number;
    lng: number;
  };
  images: string[];         // Array of image URLs
  notes: string;
  status: string;           // "healthy", "needs_attention", etc.
  createdAt: Timestamp;
  observationType: string;  // "plant", "compost", "infrastructure", etc.
  observationSubtype?: string; // e.g. "moisture", "temperature"
  specializationData?: any; // Specialized data for this observation type
}
```

### tasks

Tasks to be performed in the garden.

```typescript
{
  id: string;               // Document ID
  observationId?: string;   // Optional, if task was created from observation
  gardenId: string;
  title: string;
  description: string;
  priority: number;         // 1-5
  status: string;           // "open", "in_progress", "completed"
  assignedUsers: string[];
  createdBy: string;
  createdAt: Timestamp;
  dueDate?: Timestamp;      // Optional
  completedAt?: Timestamp;  // Optional
}
```

## Constants & Enums
```typescript
// Status options for observations
export const OBSERVATION_STATUSES = {
  HEALTHY: 'healthy',
  NEEDS_ATTENTION: 'needs_attention',
  DISEASED: 'diseased',
  WILTING: 'wilting'
};

// Status options for tasks
export const TASK_STATUSES = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

// User roles in gardens
export const USER_GARDEN_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member'
};

// User roles in the app
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};
```

## Security Rules
Access control is based on:
1. Authentication status
2. Garden membership
3. Resource ownership

See `firestore.rules` for specific implementation details.
