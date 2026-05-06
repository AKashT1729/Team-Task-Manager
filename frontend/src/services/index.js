import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

// Auth services
export const authService = {
  login: async (email, password) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post(API_ENDPOINTS.LOGOUT);
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post(API_ENDPOINTS.REFRESH_TOKEN);
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post(API_ENDPOINTS.CHANGE_PASSWORD, {
      oldPassword,
      newPassword,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get(API_ENDPOINTS.CURRENT_USER);
    return response.data;
  },

  updateAvatar: async (formData) => {
    const response = await api.patch(API_ENDPOINTS.UPDATE_AVATAR, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// User services (Admin)
export const userService = {
  getAllUsers: async () => {
    const response = await api.get(API_ENDPOINTS.USERS_LIST);
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(API_ENDPOINTS.USER_DETAIL(userId));
    return response.data;
  },

  updateUserRole: async (userId, role) => {
    const response = await api.patch(API_ENDPOINTS.UPDATE_USER_ROLE(userId), { role });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(API_ENDPOINTS.DELETE_USER(userId));
    return response.data;
  },
};

// Project services
export const projectService = {
  getAllProjects: async () => {
    const response = await api.get(API_ENDPOINTS.MY_PROJECTS);
    return response.data;
  },

  getProject: async (projectId) => {
    const response = await api.get(API_ENDPOINTS.PROJECT_DETAIL(projectId));
    return response.data;
  },

  createProject: async (projectData) => {
    const response = await api.post(API_ENDPOINTS.PROJECTS, projectData);
    return response.data;
  },

  updateProject: async (projectId, projectData) => {
    const response = await api.patch(API_ENDPOINTS.PROJECT_DETAIL(projectId), projectData);
    return response.data;
  },

  deleteProject: async (projectId) => {
    const response = await api.delete(API_ENDPOINTS.PROJECT_DETAIL(projectId));
    return response.data;
  },

  addMember: async (projectId, userId) => {
    const response = await api.post(API_ENDPOINTS.ADD_MEMBER(projectId), { userId });
    return response.data;
  },

  removeMember: async (projectId, userId) => {
    const response = await api.delete(API_ENDPOINTS.REMOVE_MEMBER(projectId, userId));
    return response.data;
  },
};

// Task services
export const taskService = {
  getProjectTasks: async (projectId) => {
    const response = await api.get(API_ENDPOINTS.PROJECT_TASKS(projectId));
    return response.data;
  },

  getTask: async (projectId, taskId) => {
    const response = await api.get(API_ENDPOINTS.TASK_DETAIL(projectId, taskId));
    return response.data;
  },

  createTask: async (projectId, taskData) => {
    const response = await api.post(API_ENDPOINTS.PROJECT_TASKS(projectId), taskData);
    return response.data;
  },

  updateTask: async (projectId, taskId, taskData) => {
    const response = await api.patch(API_ENDPOINTS.TASK_DETAIL(projectId, taskId), taskData);
    return response.data;
  },

  deleteTask: async (projectId, taskId) => {
    const response = await api.delete(API_ENDPOINTS.TASK_DETAIL(projectId, taskId));
    return response.data;
  },
};

// Dashboard services
export const dashboardService = {
  getOverview: async () => {
    const response = await api.get(API_ENDPOINTS.DASHBOARD_OVERVIEW);
    return response.data;
  },

  getTasksByStatus: async () => {
    const response = await api.get(API_ENDPOINTS.TASKS_BY_STATUS);
    return response.data;
  },

  getTasksPerUser: async () => {
    const response = await api.get(API_ENDPOINTS.TASKS_PER_USER);
    return response.data;
  },

  getOverdueTasks: async () => {
    const response = await api.get(API_ENDPOINTS.OVERDUE_TASKS);
    return response.data;
  },
};
