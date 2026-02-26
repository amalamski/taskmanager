# TaskFlow - Full-Stack Task Management Application

A modern, full-stack task management application with JWT authentication, PostgreSQL database, and a beautiful React frontend.

## 🚀 Features

### Frontend
- **Board View (Kanban)**: Drag-and-drop task management across columns
- **Calendar View**: Weekly calendar with task visualization
- **Freestyle Area**: Free-form sticky notes for brainstorming
- **Statistics Dashboard**: Comprehensive analytics and insights
- **Filtering System**: Filter tasks by status, priority, assignee, and tags
- **Responsive Design**: Works seamlessly on all devices

### Backend
- **RESTful API**: Clean, well-structured API endpoints
- **JWT Authentication**: Secure user authentication with tokens
- **PostgreSQL Database**: Reliable data persistence with Prisma ORM
- **User Management**: Registration, login, and profile management
- **Task Management**: Full CRUD operations for tasks
- **Authorization**: Protected routes and user-specific data isolation
- **Input Validation**: Zod schema validation for all inputs
- **Error Handling**: Comprehensive error handling middleware

## 📁 Project Structure

```
taskflow/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── context/            # React Context providers (Auth, Tasks)
│   ├── lib/                # API client and utilities
│   ├── pages/              # Page components
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Helper functions
│   └── App.tsx             # Main application component
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── lib/            # Database, JWT, validation utilities
│   │   ├── middleware/     # Auth and error handling middleware
│   │   ├── routes/         # API route handlers
│   │   └── index.ts        # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Database seeding script
│   └── package.json
└── README.md
```

## 🛠️ Technology Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS 4** for styling
- **React Router** for navigation
- **date-fns** for date manipulation
- **Lucide React** for icons
- **Axios** for API requests

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma** ORM for database operations
- **PostgreSQL** database
- **JWT** for authentication
- **bcrypt** for password hashing
- **Zod** for input validation
- **CORS** for cross-origin requests

## 📋 Prerequisites

- **Node.js** v18+ 
- **PostgreSQL** v14+ or a PostgreSQL-compatible database
- **npm** or **yarn**

## 🔧 Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL with Docker
docker run -d \
  --name taskflow-db \
  -e POSTGRES_USER=taskflow \
  -e POSTGRES_PASSWORD=taskflow123 \
  -e POSTGRES_DB=taskflow \
  -p 5432:5432 \
  postgres:15-alpine
```

#### Option B: Local PostgreSQL Installation

1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/)
2. Create a database:
```bash
createdb taskflow
```

### 3. Configure Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your configuration:

```env
# Database (update with your credentials)
DATABASE_URL="postgresql://taskflow:taskflow123@localhost:5432/taskflow?schema=public"

# JWT (change in production!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:5173"
```

### 4. Database Migration and Seeding

```bash
cd server

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed the database with demo data
npm run db:seed

cd ..
```

## 🚀 Running the Application

### Start the Backend Server

```bash
cd server

# Development mode (with hot reload)
npm run dev

# Or production mode
npm run build
npm start
```

The API will be available at `http://localhost:3001`

### Start the Frontend

In a new terminal:

```bash
# Development mode
npm run dev

# Build for production
npm run build
npm run preview
```

The frontend will be available at `http://localhost:5173`

## 🔐 Demo Credentials

After seeding the database, you can login with:

- **Email**: `demo@taskflow.com`
- **Password**: `password123`

Or create a new account using the Sign Up form.

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Tasks

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tasks` | Get all user tasks | Yes |
| GET | `/api/tasks/:id` | Get single task | Yes |
| POST | `/api/tasks` | Create new task | Yes |
| PATCH | `/api/tasks/:id` | Update task | Yes |
| DELETE | `/api/tasks/:id` | Delete task | Yes |

### Query Parameters for GET /api/tasks

- `status`: Filter by status (TODO, IN_PROGRESS, REVIEW, DONE)
- `priority`: Filter by priority (LOW, MEDIUM, HIGH)
- `search`: Search in title and description

### Example API Requests

#### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### Create Task
```bash
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "New Task",
    "description": "Task description",
    "status": "TODO",
    "priority": "HIGH",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-07T23:59:59Z",
    "color": "#8B5CF6",
    "tagIds": []
  }'
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **CORS Protection**: Configured allowed origins
- **User Isolation**: Users can only access their own tasks
- **Role-Based Access**: USER and ADMIN roles (extensible)

## 📊 Database Schema

### User
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `passwordHash` (String)
- `name` (String, Optional)
- `avatar` (String, Optional)
- `color` (String)
- `role` (Enum: USER, ADMIN)
- `createdAt`, `updatedAt` (DateTime)

### Task
- `id` (UUID, Primary Key)
- `title` (String)
- `description` (String, Optional)
- `status` (Enum: TODO, IN_PROGRESS, REVIEW, DONE)
- `priority` (Enum: LOW, MEDIUM, HIGH)
- `startDate`, `endDate` (DateTime)
- `color` (String)
- `completedAt` (DateTime, Optional)
- `userId` (UUID, Foreign Key)
- `createdAt`, `updatedAt` (DateTime)

### Tag
- `id` (UUID, Primary Key)
- `name` (String, Unique)
- `color` (String)

### TaskTag (Junction Table)
- `taskId`, `tagId` (Composite Primary Key)

## 🎨 Frontend Features

### Board View
- Drag-and-drop between columns
- Color-coded tasks
- Priority badges
- Tags and assignees
- Quick add/edit/delete

### Calendar View
- Weekly view with navigation
- Task visualization on dates
- Today quick navigation
- Week summary statistics

### Freestyle Area
- Draggable sticky notes
- Multiple color options
- Free-form text editing
- Grid pattern background

### Statistics
- Overview cards (total, completed, rate, avg time)
- Status distribution chart
- Priority breakdown
- Weekly completion trend
- Team performance metrics
- Tags usage visualization

## 🔧 Development Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend
```bash
npm run dev          # Start development server (tsx watch)
npm run build        # Compile TypeScript
npm start            # Start production server
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with demo data
```

## 🚨 Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in `.env`
- Ensure database exists

### Port Already in Use
- Change PORT in `server/.env`
- Update FRONTEND_URL if changing frontend port

### JWT Errors
- Ensure JWT_SECRET is set in `.env`
- Clear browser localStorage and re-login

### Prisma Errors
- Run `npm run db:generate` after schema changes
- Run `npm run db:migrate` to apply migrations

## 📝 Best Practices Implemented

1. **Type Safety**: Full TypeScript coverage
2. **Error Handling**: Centralized error handling middleware
3. **Validation**: Input validation on all endpoints
4. **Security**: Password hashing, JWT auth, CORS
5. **Code Organization**: Clean separation of concerns
6. **Scalability**: Modular architecture, easy to extend
7. **Documentation**: Inline comments and README
8. **Environment Variables**: Configuration via .env files

## 🔄 Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Real-time updates with WebSockets
- [ ] File attachments
- [ ] Comments on tasks
- [ ] Task dependencies
- [ ] Recurring tasks
- [ ] Export/Import functionality
- [ ] Mobile app (React Native)

## 📄 License

MIT License - feel free to use this project for learning or production.

## 👨‍💻 Author

Built with ❤️ using modern web technologies.
