import { useDashboard } from "../hooks/useDashboard";
import { useProjects } from "../hooks/useProjects";
import { Card, CardBody, Badge, PageLoader } from "../components/ui";
import { FolderKanban, CheckCircle, Clock, AlertTriangle, ListTodo } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate, isOverdue } from "../lib/utils";

const statusColors = {
  todo: "default",
  "in-progress": "primary",
  review: "warning",
  done: "success",
};

const priorityColors = {
  low: "default",
  medium: "warning",
  high: "danger",
};

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboard();
  const { data: projects, isLoading: projectsLoading } = useProjects();

  if (statsLoading || projectsLoading) return <PageLoader />;

  const recentTasks = stats?.recentActivity || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of your team's progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary-100">
              <ListTodo className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalTasks || 0}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.tasksByStatus?.["in-progress"] || 0}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.tasksByStatus?.done || 0}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-100">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.overdueTasks || 0}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
              <Link to="/projects" className="text-sm text-primary-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {projects?.slice(0, 5).map((project) => (
                <Link
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-primary-100">
                    <FolderKanban className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{project.name}</p>
                    <p className="text-sm text-gray-500">
                      {project.members?.length || 0} members
                    </p>
                  </div>
                </Link>
              ))}
              {(!projects || projects.length === 0) && (
                <p className="text-center text-gray-500 py-8">No projects yet</p>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardBody>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 truncate">{task.title}</p>
                      {isOverdue(task.dueDate) && task.status !== "done" && (
                        <Badge variant="danger">Overdue</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusColors[task.status] || "default"}>{task.status}</Badge>
                      <Badge variant={priorityColors[task.priority] || "default"}>{task.priority}</Badge>
                      {task.project?.name && (
                        <span className="text-xs text-gray-400">{task.project.name}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {recentTasks.length === 0 && (
                <p className="text-center text-gray-500 py-8">No recent activity</p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}