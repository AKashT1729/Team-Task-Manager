import api from "../lib/api";

export const authService = {
  register: (data) => api.post("/users/register", data),
  login: (data) => api.post("/users/login", data),
  logout: () => api.post("/users/logout"),
  getMe: () => api.get("/users/current-user"),
};

export const projectService = {
  getAll: () => api.get("/projects/my-projects"),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post("/projects", data),
  update: (id, data) => api.patch(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  addMember: (projectId, userId) => api.post(`/projects/${projectId}/members`, { userId }),
  removeMember: (projectId, userId) => api.delete(`/projects/${projectId}/members/${userId}`),
};

export const taskService = {
  getByProject: (projectId) => api.get(`/projects/${projectId}/tasks`),
  getById: (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}`),
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  update: (projectId, taskId, data) => api.patch(`/projects/${projectId}/tasks/${taskId}`, data),
  delete: (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`),
};

export const dashboardService = {
  getOverview: () => api.get("/dashboard/overview"),
  getTasksByStatus: () => api.get("/dashboard/tasks-by-status"),
  getTasksPerUser: () => api.get("/dashboard/tasks-per-user"),
  getOverdueTasks: () => api.get("/dashboard/overdue-tasks"),
};

export const userService = {
  getAll: () => api.get("/users/admin/users"),
  getById: (userId) => api.get(`/users/admin/users/${userId}`),
  updateRole: (userId, role) => api.patch(`/users/admin/users/${userId}/role`, { role }),
  delete: (userId) => api.delete(`/users/admin/users/${userId}`),
};