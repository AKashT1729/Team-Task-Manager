# Team Task Manager - Complete Full-Stack Application

A full-featured team task management system similar to Trello/Asana with role-based access control, built with Node.js + MongoDB + React.

## Tech Stack

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication (access + refresh tokens)
- Cloudinary for file uploads
- bcrypt for password hashing

**Frontend**
- React 18 with React Router v6
- Vite build tool
- Tailwind CSS for styling
- React Query for data fetching
- Axios for HTTP
- React Hot Toast for notifications

## Features

### User Authentication
- Secure login with JWT tokens stored in HTTP-only cookies
- Admin-only user registration
- Password change functionality
- Session management with refresh tokens

### Project Management
- Create projects (creator becomes Admin automatically)
- View all projects
- Project details with member list
- Add/remove members (Admin only)
- Delete projects (Creator only)

### Task Management
- Create tasks with title, description, priority, due date
- Assign tasks to project members
- Track status: To Do → In Progress → Review → Done
- Update task details (admins can edit all, assignees can update status+description)
- Delete tasks (admin/creator only)
- Overdue task highlighting

### Dashboard
- Total projects, tasks, overdue count, pending tasks
- Tasks by status breakdown
- Recent activity feed
- Tasks distribution per user (admin only)

### Admin Panel
- View all users
- Promote/demote admin role
- Delete users (with automatic task reassignment and project cleanup)

### Role-Based Access
| Action | Admin | Member |
|--------|-------|--------|
| Create project | ✅ | ✅ |
| Manage project members | ✅ | ❌ |
| Create tasks | ✅ | ❌ |
| View all project tasks | ✅ | Assigned only |
| Update task (full) | ✅ | Status+desc only |
| Manage users | ✅ | ❌ |

## Folder Structure

```
Team Task Manager (Full-Stack)/
├── backend/
│   ├── controllers/
│   │   ├── user.controller.js
│   │   ├── project.controller.js
│   │   ├── task.controller.js
│   │   └── dashboard.controller.js
│   ├── middlewares/
│   │   ├── auth.middlewares.js
│   │   ├── role.middleware.js
│   │   ├── validation.middleware.js
│   │   └── multer.middleware.js
│   ├── models/
│   │   ├── user.models.js
│   │   ├── project.models.js
│   │   └── task.models.js
│   ├── routes/
│   │   ├── user.routes.js
│   │   ├── project.routes.js
│   │   ├── task.routes.js
│   │   └── dashboard.routes.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   └── cloudinary.js
│   ├── db/
│   │   └── index.js
│   ├── scripts/
│   │   └── createAdmin.js
│   ├── .env
│   ├── app.js
│   ├── index.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardLayout.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── ProjectDetail.jsx
│   │   │   ├── TaskCreate.jsx
│   │   │   ├── TaskDetail.jsx
│   │   │   └── Users.jsx
│   │   ├── services/
│   │   │   └── index.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
└── README.md (you are here)
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend will run on `http://localhost:8000`

**Default Admin Credentials:**
- Email: `thakare.akash007@gmail.com`
- Password: `123456789`

> ⚠️ **Important:** The admin was created via `backend/scripts/createAdmin.js`. You can modify the credentials there or create additional admins through the frontend.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

### 3. Access the Application

1. Open browser to `http://localhost:5173`
2. Login with admin credentials
3. Start creating projects and tasks!

## API Documentation

### Authentication Endpoints
```
POST   /api/v1/users/register    (Admin only)
POST   /api/v1/users/login
POST   /api/v1/users/logout
POST   /api/v1/users/refresh-token
POST   /api/v1/users/change-password
GET    /api/v1/users/current-user
PATCH  /api/v1/users/avatar-upload
```

### User Management (Admin)
```
GET    /api/v1/users/admin/users
GET    /api/v1/users/admin/users/:id
PATCH  /api/v1/users/admin/users/:id/role
DELETE /api/v1/users/admin/users/:id
```

### Projects
```
POST   /api/v1/projects/           (Create)
GET    /api/v1/projects/my-projects (List)
GET    /api/v1/projects/:id        (View)
PATCH  /api/v1/projects/:id        (Update)
DELETE /api/v1/projects/:id        (Delete)
POST   /api/v1/projects/:id/members (Add member)
DELETE /api/v1/projects/:id/members/:userId (Remove member)
```

### Tasks
```
POST   /api/v1/tasks/projects/:projectId/tasks     (Create)
GET    /api/v1/tasks/projects/:projectId/tasks     (List)
GET    /api/v1/tasks/projects/:projectId/tasks/:id (View)
PATCH  /api/v1/tasks/projects/:projectId/tasks/:id (Update)
DELETE /api/v1/tasks/projects/:projectId/tasks/:id (Delete)
```

### Dashboard
```
GET    /api/v1/dashboard/overview
GET    /api/v1/dashboard/tasks-by-status
GET    /api/v1/dashboard/tasks-per-user      (Admin only)
GET    /api/v1/dashboard/overdue-tasks
```

## Database Schema

### User
```javascript
{
  _id: ObjectId,
  email: String (unique, indexed),
  name: String (indexed),
  avatar: String,
  role: String ('user' | 'admin'),
  password: String (hashed),
  refreshToken: String (indexed),
  createdAt: Date,
  updatedAt: Date
}
```

### Project
```javascript
{
  _id: ObjectId,
  name: String (indexed),
  description: String,
  creator: ObjectId (ref: User),
  admins: [ObjectId] (ref: User),
  members: [ObjectId] (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

### Task
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  project: ObjectId (ref: Project, indexed),
  assignedTo: ObjectId (ref: User, indexed),
  createdBy: ObjectId (ref: User, indexed),
  status: String ('todo' | 'in-progress' | 'review' | 'done', indexed),
  priority: String ('low' | 'medium' | 'high', indexed),
  dueDate: Date (indexed),
  createdAt: Date,
  updatedAt: Date
}
```

## Configuration

### Backend Environment (.env)
```env
PORT=8000
MONGODB_URL=mongodb+srv://...
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUD_NAME=your_cloud_name
API_KEY_CLOUDINARY=your_key
API_SECRET_CLOUDINARY=your_secret
```

### Frontend Environment (.env)
```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Common Issues & Solutions

### 1. CORS Errors
Ensure `CORS_ORIGIN` in backend `.env` includes frontend URL (`http://localhost:5173`).

### 2. MongoDB Connection
- Check MONGODB_URL is correct and accessible
- Whitelist your IP in MongoDB Atlas if using cloud
- Ensure database name is `team_task_manager`

### 3. JWT Token Errors
- Verify ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET are set
- Tokens are stored in HTTP-only cookies automatically

### 4. Avatar Upload Fails
- Configure Cloudinary credentials in `.env`
- Default avatar is used as fallback

### 5. "User not found" on login
- Verify admin was created via `node scripts/createAdmin.js`
- Check MongoDB collections for `users` documents

## Development

### Adding New Features
1. Backend: Add model → controller → route → test
2. Frontend: Add service method → page/component → connect to UI
3. Follow existing patterns for consistency

### Code Style
- Backend: ES Modules, async/await, camelCase
- Frontend: React functional components, hooks, Tailwind classes

### Testing
Currently no automated tests. Manual testing via browser recommended.

## Production Deployment

### Backend
- Set environment variables in production
- Use process manager (PM2)
- Enable HTTPS
- Use secure CORS settings

### Frontend
```bash
npm run build
```
Deploy `dist/` folder to Vercel/Netlify/static host
Set `VITE_API_URL` to production backend URL

## License

ISC

## Support

For issues or questions, refer to the repository issues page.

---

**Built with modern JavaScript, beautiful design, and best practices.**
