import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService, taskService } from '../services';
import { formatDate } from '../utils/helpers';
import {
  ArrowLeft,
  Users,
  Calendar,
  Plus,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        projectService.getProject(projectId),
        taskService.getProjectTasks(projectId),
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    setSubmitting(true);
    try {
      // First get all users to find by email
      const usersRes = await fetch('http://localhost:8000/api/v1/users/admin/users', {
        credentials: 'include',
      });
      const usersData = await usersRes.json();
      const user = usersData.data?.find((u) => u.email === newMemberEmail);

      if (!user) {
        toast.error('User not found');
        return;
      }

      await projectService.addMember(projectId, user._id);
      await fetchProjectData();
      setNewMemberEmail('');
      setShowMemberModal(false);
      toast.success('Member added successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;

    try {
      await projectService.removeMember(projectId, userId);
      await fetchProjectData();
      toast.success('Member removed');
    } catch (error) {
      toast.error(error.message || 'Failed to remove member');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this project and all its tasks?')) return;

    try {
      await projectService.deleteProject(projectId);
      navigate('/projects');
      toast.success('Project deleted!');
    } catch (error) {
      toast.error(error.message || 'Failed to delete project');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  const isAdmin = project.admins?.some((admin) => admin._id === localStorage.getItem('userId')) || false;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Projects
      </button>

      {/* Project Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-2">{project.description || 'No description'}</p>
          </div>
          {isAdmin && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMemberModal(true)}
                className="flex items-center px-3 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Users className="w-4 h-4 mr-2" />
                Manage Members
              </button>
              <button
                onClick={handleDeleteProject}
                className="flex items-center px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center text-sm text-gray-500 space-x-4">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Created {formatDate(project.createdAt)}
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {project.members?.length || 0} members
          </div>
        </div>

        {/* Members List */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Team Members</h3>
          <div className="flex flex-wrap gap-2">
            {project.members?.map((member) => (
              <div
                key={member._id}
                className="flex items-center px-3 py-1.5 bg-gray-100 rounded-full"
              >
                <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-medium">
                  {member.name?.charAt(0)?.toUpperCase()}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700">{member.name}</span>
                {project.admins?.some((admin) => admin._id === member._id) && (
                  <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
                    Admin
                  </span>
                )}
                {isAdmin && member._id !== project.creator._id && (
                  <button
                    onClick={() => handleRemoveMember(member._id)}
                    className="ml-2 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
          {isAdmin && (
            <Link
              to={`/projects/${projectId}/tasks/create`}
              className="flex items-center px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Link>
          )}
        </div>

        {tasks.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <Link
                key={task._id}
                to={`/projects/${projectId}/tasks/${task._id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {task.description || 'No description'}
                    </p>
                    <div className="mt-3 flex items-center space-x-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          task.status === 'todo'
                            ? 'bg-gray-100 text-gray-700'
                            : task.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-700'
                            : task.status === 'review'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {task.status.replace('-', ' ')}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full ${
                          task.priority === 'low'
                            ? 'bg-emerald-100 text-emerald-700'
                            : task.priority === 'medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-gray-500">
                          Due: {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    {task.assignedTo ? (
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-medium">
                          {task.assignedTo.name?.charAt(0)?.toUpperCase()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Unassigned</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">No tasks in this project yet</p>
            {isAdmin && (
              <Link
                to={`/projects/${projectId}/tasks/create`}
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Task
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add Team Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Email
                </label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="Enter user email"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the email of an existing user
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newMemberEmail.trim()}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
