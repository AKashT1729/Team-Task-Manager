# Team Task Manager - Frontend

A modern React application for team task and project management with role-based access control.

## Features

- **User Authentication** - Secure login with JWT tokens
- **Project Management** - Create, view, update, delete projects
- **Task Management** - Create tasks, assign to team members, track status (To Do, In Progress, Review, Done)
- **Role-Based Access** - Admin and Member roles with different permissions
- **Dashboard** - Real-time statistics and analytics
- **Admin Panel** - User management and role assignment
- **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching and caching
- **Axios** - HTTP client
- **React Hook Form** - Form validation
- **React Hot Toast** - Notifications
- **Lucide React** - Icon library
- **Date-fns** - Date formatting

## Prerequisites

- Node.js 18+ installed
- Backend server running (see backend README)

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── DashboardLayout.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Projects.jsx
│   │   ├── ProjectDetail.jsx
│   │   ├── TaskCreate.jsx
│   │   ├── TaskDetail.jsx
│   │   └── Users.jsx
│   ├── services/           # API services
│   │   └── index.js
│   ├── context/            # React Context
│   │   └── AuthContext.jsx
│   ├── utils/              # Utilities & constants
│   │   ├── constants.js
│   │   └── helpers.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Key Components

### Authentication
- **Login Page** - Authenticate with email/password
- **AuthContext** - Global authentication state management
- **ProtectedRoute** - Route guard for authenticated users
- **AdminRoute** - Route guard for admin-only pages

### Dashboard
- Overview statistics (projects, tasks, overdue, pending)
- Tasks by status breakdown
- Recent activity feed
- Task distribution per user (admin only)

### Projects
- List all projects with creation date
- Create new projects (any authenticated user)
- View project details with member list
- Manage members (add/remove - admin only)
- Delete projects (creator only)

### Tasks
- Create tasks within projects (admin only)
- View task details
- Update status, priority, due date, assignment
- Delete tasks (admin/creator only)
- Status workflow: To Do → In Progress → Review → Done

### Users (Admin)
- View all registered users
- Promote/demote admin status
- Delete users (reassigns tasks, removes from projects)

## API Integration

All API calls are handled through the `services/` layer:
- `authService` - Authentication endpoints
- `projectService` - Project CRUD operations
- `taskService` - Task management
- `userService` - Admin user operations
- `dashboardService` - Analytics & statistics

Base URL is configurable via `VITE_API_URL` environment variable.

## Role-Based Permissions

| Role | Create Project | Manage Members | Create Tasks | View All Tasks | Manage Users |
|------|---------------|---------------|--------------|---------------|--------------|
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ |
| User | ✓ | ✗ | ✗ | Assigned only | ✗ |

## Form Validation

- **Login** - Email format, required fields
- **Project** - Name (min 3 chars), optional description
- **Task** - Title (min 3 chars), priority, status, due date, optional assignee

All validation happens client-side with instant feedback.

## Styling

- **Tailwind CSS** for all styling
- **Custom color palette** in `tailwind.config.js`
- **Responsive breakpoints**: mobile-first design
- **Status badges**: color-coded by status and priority
- **Custom scrollbars** in global CSS

## State Management

- **React Context** for authentication state
- **React Query** for server state (data fetching, caching, mutations)
- **LocalStorage** for persisting user session

## Error Handling

- Centralized error handling via Axios interceptors
- Toast notifications for success/error feedback
- 401 redirects to login page automatically
- Loading states for all async operations

## Development Tips

1. The backend must be running before starting the frontend
2. Check browser console for API errors
3. Use React Query DevTools for debugging data fetching (optional)
4. Mock data can be added in `services/` for offline development

## Building for Production

```bash
npm run build
```

Build output will be in the `dist/` folder. Deploy to any static hosting service (Vercel, Netlify, etc.) and configure the backend URL accordingly.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API base URL | http://localhost:8000/api/v1 |

## License

ISC
