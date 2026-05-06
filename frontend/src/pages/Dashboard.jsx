import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services';
import { formatDate, isOverdue } from '../utils/helpers';
import {
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  Clock,
  ChevronRight,
} from 'lucide-react';

const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewData] = await Promise.all([
          dashboardService.getOverview(),
        ]);
        setOverview(overviewData.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Projects',
      value: overview?.totalProjects || 0,
      icon: FolderKanban,
      color: 'bg-blue-500',
      bg: 'bg-blue-50',
    },
    {
      title: 'Total Tasks',
      value: overview?.totalTasks || 0,
      icon: CheckSquare,
      color: 'bg-green-500',
      bg: 'bg-green-50',
    },
    {
      title: 'Overdue Tasks',
      value: overview?.overdueTasks || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bg: 'bg-red-50',
    },
    {
      title: 'Pending Tasks',
      value:
        (overview?.tasksByStatus?.todo || 0) +
        (overview?.tasksByStatus?.['in-progress'] || 0) +
        (overview?.tasksByStatus?.review || 0),
      icon: Clock,
      color: 'bg-amber-500',
      bg: 'bg-amber-50',
    },
  ];

  const statusData = [
    { label: 'To Do', value: overview?.tasksByStatus?.todo || 0, color: 'bg-gray-500' },
    { label: 'In Progress', value: overview?.tasksByStatus?.['in-progress'] || 0, color: 'bg-blue-500' },
    { label: 'Review', value: overview?.tasksByStatus?.review || 0, color: 'bg-yellow-500' },
    { label: 'Done', value: overview?.tasksByStatus?.done || 0, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your task overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Status</h2>
          <div className="space-y-4">
            {statusData.map((status) => (
              <div key={status.label} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${status.color} mr-3`}></div>
                  <span className="text-gray-700">{status.label}</span>
                </div>
                <span className="font-semibold text-gray-900">{status.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
            <Link
              to="/projects"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {overview?.recentActivity?.length > 0 ? (
            <div className="space-y-4">
              {overview.recentActivity.map((task) => (
                <div
                  key={task._id}
                  className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 line-clamp-1">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {task.project?.name} • {formatDate(task.dueDate)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        task.status === 'done'
                          ? 'bg-green-100 text-green-700'
                          : task.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700'
                          : task.status === 'review'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {task.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent tasks</p>
          )}
        </div>
      </div>

      {/* Tasks Per User (Admin only) */}
      {overview?.tasksPerUser?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tasks Distribution</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overview.tasksPerUser.slice(0, 6).map((user) => (
              <div
                key={user._id}
                className="border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
                    {user.userName?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{user.userName}</p>
                    <p className="text-sm text-gray-500">{user.totalTasks} tasks</p>
                  </div>
                </div>
                {user.pending !== null && (
                  <div className="mt-3 flex justify-between text-sm">
                    <span className="text-gray-600">Pending: {user.pending}</span>
                    <span className="text-green-600">Done: {user.completed || 0}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
