// Task status options
export const TASK_STATUS = [
  { value: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-700' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'review', label: 'Review', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'done', label: 'Done', color: 'bg-green-100 text-green-700' },
];

// Task priority options
export const TASK_PRIORITY = [
  { value: 'low', label: 'Low', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-700' },
];

// Helper functions
export const getStatusLabel = (status) => {
  const statusObj = TASK_STATUS.find((s) => s.value === status);
  return statusObj ? statusObj.label : status;
};

export const getStatusColor = (status) => {
  const statusObj = TASK_STATUS.find((s) => s.value === status);
  return statusObj ? statusObj.color : 'bg-gray-100 text-gray-700';
};

export const getPriorityColor = (priority) => {
  const priorityObj = TASK_PRIORITY.find((p) => p.value === priority);
  return priorityObj ? priorityObj.color : 'bg-gray-100 text-gray-700';
};

export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
};
