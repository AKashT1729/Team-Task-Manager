// API endpoint constants
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/users/login',
  REGISTER: '/users/register',
  LOGOUT: '/users/logout',
  REFRESH_TOKEN: '/users/refresh-token',
  CHANGE_PASSWORD: '/users/change-password',
  CURRENT_USER: '/users/current-user',
  UPDATE_AVATAR: '/users/avatar-upload',

  // Users (Admin)
  USERS_LIST: '/users/admin/users',
  USER_DETAIL: (id) => `/users/admin/users/${id}`,
  UPDATE_USER_ROLE: (id) => `/users/admin/users/${id}/role`,
  DELETE_USER: (id) => `/users/admin/users/${id}`,

  // Projects
  PROJECTS: '/projects',
  MY_PROJECTS: '/projects/my-projects',
  PROJECT_DETAIL: (id) => `/projects/${id}`,
  ADD_MEMBER: (projectId) => `/projects/${projectId}/members`,
  REMOVE_MEMBER: (projectId, userId) => `/projects/${projectId}/members/${userId}`,

  // Tasks
  PROJECT_TASKS: (projectId) => `/tasks/projects/${projectId}/tasks`,
  TASK_DETAIL: (projectId, taskId) => `/tasks/projects/${projectId}/tasks/${taskId}`,

  // Dashboard
  DASHBOARD_OVERVIEW: '/dashboard/overview',
  TASKS_BY_STATUS: '/dashboard/tasks-by-status',
  TASKS_PER_USER: '/dashboard/tasks-per-user',
  OVERDUE_TASKS: '/dashboard/overdue-tasks',
};
