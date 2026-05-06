import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { taskService, projectService } from '../services';
import { formatDate, isOverdue, getStatusColor, getPriorityColor } from '../utils/helpers';
import {
  ArrowLeft,
  Calendar,
  User,
  AlertTriangle,
  Edit2,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TaskDetail = () => {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTaskData();
  }, [taskId, projectId]);

  const fetchTaskData = async () => {
    try {
      const [taskRes, projectRes] = await Promise.all([
        taskService.getTask(projectId, taskId),
        projectService.getProject(projectId),
      ]);
      setTask(taskRes.data);
      setProject(projectRes.data);
      setEditForm(taskRes.data);
    } catch (error) {
      toast.error('Failed to load task');
      navigate(`/projects/${projectId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await taskService.updateTask(projectId, taskId, editForm);
      await fetchTaskData();
      setShowEditModal(false);
      toast.success('Task updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Delete this task?')) return;

    try {
      await taskService.deleteTask(projectId, taskId);
      navigate(`/projects/${projectId}`);
      toast.success('Task deleted!');
    } catch (error) {
      toast.error(error.message || 'Failed to delete task');
    }
  };

  const canEdit = task && (task.assignedTo?._id === localStorage.getItem('userId'));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!task) {
    return <div>Task not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/projects/${projectId}`)}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to {project?.name || 'Project'}
      </button>

      {/* Task Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                {task.status.replace('-', ' ')}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            {task.description && (
              <p className="text-gray-600 mt-3 leading-relaxed">{task.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {canEdit && (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </button>
            )}
            {(task.createdBy?._id === localStorage.getItem('userId') || project?.admins?.some(a => a._id === localStorage.getItem('userId'))) && (
              <button
                onClick={handleDeleteTask}
                className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center text-sm">
            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-600">Due: </span>
            <span className={`ml-1 font-medium ${isOverdue(task.dueDate) && task.status !== 'done' ? 'text-red-600' : 'text-gray-900'}`}>
              {formatDate(task.dueDate)}
            </span>
            {isOverdue(task.dueDate) && task.status !== 'done' && (
              <span className="ml-2 flex items-center text-red-600 text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Overdue
              </span>
            )}
          </div>
          <div className="flex items-center text-sm">
            <User className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-600">Assigned to: </span>
            <span className="ml-1 font-medium text-gray-900">
              {task.assignedTo?.name || 'Unassigned'}
            </span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-600">Created by: </span>
            <span className="ml-1 font-medium text-gray-900">{task.createdBy?.name}</span>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Task</h2>
            <form onSubmit={handleUpdateTask}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={editForm.status || 'todo'}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={editForm.priority || 'medium'}
                      onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editForm.dueDate ? editForm.dueDate.split('T')[0] : ''}
                    onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                {canEdit && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To (optional)
                    </label>
                    <select
                      value={editForm.assignedTo || ''}
                      onChange={(e) => setEditForm({ ...editForm, assignedTo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    >
                      <option value="">Unassigned</option>
                      {project?.members?.map((member) => (
                        <option key={member._id} value={member._id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
