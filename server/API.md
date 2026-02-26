# TaskFlow API Documentation

Base URL: `http://localhost:3001/api`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Auth Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "JD",
    "color": "#8B5CF6",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `409` - User with this email already exists
- `400` - Validation error (invalid email, weak password)

---

### POST /auth/login

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "JD",
    "color": "#8B5CF6",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `401` - Invalid email or password

---

### GET /auth/me

Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "JD",
    "color": "#8B5CF6",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
- `401` - Invalid or missing token
- `404` - User not found

---

## Task Endpoints

All task endpoints require authentication.

### GET /tasks

Get all tasks for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by status (TODO, IN_PROGRESS, REVIEW, DONE)
- `priority` (optional): Filter by priority (LOW, MEDIUM, HIGH)
- `search` (optional): Search in title and description

**Example:**
```
GET /tasks?status=IN_PROGRESS&priority=HIGH&search=bug
```

**Response (200):**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Fix navigation bug",
      "description": "Navigation not working on mobile",
      "status": "in-progress",
      "priority": "high",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-07T23:59:59.000Z",
      "color": "#EF4444",
      "completedAt": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-02T00:00:00.000Z",
      "tags": [
        {
          "id": "uuid",
          "name": "Bug",
          "color": "#EF4444"
        },
        {
          "id": "uuid",
          "name": "Frontend",
          "color": "#3B82F6"
        }
      ]
    }
  ]
}
```

---

### GET /tasks/:id

Get a specific task by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "task": {
    "id": "uuid",
    "title": "Fix navigation bug",
    "description": "Navigation not working on mobile",
    "status": "in-progress",
    "priority": "high",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-07T23:59:59.000Z",
    "color": "#EF4444",
    "completedAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z",
    "tags": [...]
  }
}
```

**Errors:**
- `404` - Task not found (or not owned by user)

---

### POST /tasks

Create a new task.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description (optional)",
  "status": "TODO",
  "priority": "MEDIUM",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-07T23:59:59.000Z",
  "color": "#8B5CF6",
  "tagIds": ["uuid1", "uuid2"]
}
```

**Required Fields:**
- `title` (string, 1-200 characters)
- `startDate` (ISO 8601 datetime)
- `endDate` (ISO 8601 datetime)

**Optional Fields:**
- `description` (string, max 2000 characters)
- `status` (default: TODO)
- `priority` (default: MEDIUM)
- `color` (default: #8B5CF6)
- `tagIds` (default: [])

**Valid Status Values:**
- `TODO`
- `IN_PROGRESS`
- `REVIEW`
- `DONE`

**Valid Priority Values:**
- `LOW`
- `MEDIUM`
- `HIGH`

**Response (201):**
```json
{
  "message": "Task created successfully",
  "task": {
    "id": "uuid",
    "title": "New Task",
    "description": "Task description",
    "status": "todo",
    "priority": "medium",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-07T23:59:59.000Z",
    "color": "#8B5CF6",
    "completedAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "tags": [...]
  }
}
```

**Note:** If status is set to `DONE`, `completedAt` is automatically set.

---

### PATCH /tasks/:id

Update an existing task.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "startDate": "2024-01-02T00:00:00.000Z",
  "endDate": "2024-01-08T23:59:59.000Z",
  "color": "#10B981",
  "tagIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Response (200):**
```json
{
  "message": "Task updated successfully",
  "task": {
    "id": "uuid",
    "title": "Updated Title",
    "description": "Updated description",
    "status": "in-progress",
    "priority": "high",
    "startDate": "2024-01-02T00:00:00.000Z",
    "endDate": "2024-01-08T23:59:59.000Z",
    "color": "#10B981",
    "completedAt": null,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-02T00:00:00.000Z",
    "tags": [...]
  }
}
```

**Note:** 
- When status changes to `DONE`, `completedAt` is automatically set
- When status changes from `DONE` to another status, `completedAt` is cleared
- Updating `tagIds` replaces all existing tags

**Errors:**
- `404` - Task not found (or not owned by user)
- `400` - Validation error

---

### DELETE /tasks/:id

Delete a task.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Task deleted successfully"
}
```

**Errors:**
- `404` - Task not found (or not owned by user)

---

## Error Response Format

All errors follow this format:

```json
{
  "error": "Error message here"
}
```

In development mode, errors also include a stack trace:

```json
{
  "error": "Error message here",
  "stack": "Error: ...\n    at ..."
}
```

### Common Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently, there is no rate limiting implemented. In production, consider adding rate limiting middleware.

---

## CORS

The API is configured to accept requests from:
- `http://localhost:5173` (default Vite dev server)

Update `FRONTEND_URL` in `.env` to change the allowed origin.

---

## Health Check

### GET /api/health

Check if the API is running.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Example Usage with Fetch

```javascript
// Login
const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'demo@taskflow.com',
    password: 'password123'
  })
});

const { token } = await loginResponse.json();

// Get tasks
const tasksResponse = await fetch('http://localhost:3001/api/tasks', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const { tasks } = await tasksResponse.json();

// Create task
const createResponse = await fetch('http://localhost:3001/api/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'New Task',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'TODO',
    priority: 'MEDIUM',
    color: '#8B5CF6',
    tagIds: []
  })
});

const { task } = await createResponse.json();
```

---

## Example Usage with Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' }
});

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
const { data: { token } } = await api.post('/auth/login', {
  email: 'demo@taskflow.com',
  password: 'password123'
});
localStorage.setItem('token', token);

// Get tasks
const { data: { tasks } } = await api.get('/tasks');

// Create task
const { data: { task } } = await api.post('/tasks', {
  title: 'New Task',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
});
```
