import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useProject, useAddMember, useRemoveMember } from "../hooks/useProjects";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "../hooks/useTasks";
import { useUsers } from "../hooks/useUsers";
import {
  Card, CardBody, Button, Modal, Input, Select, Textarea,
  Badge, Avatar, PageLoader, EmptyState
} from "../components/ui";
import {
  ArrowLeft, Plus, Trash2, Users, Calendar,
  Flag, MoreVertical, X
} from "lucide-react";
import { formatDate, isOverdue } from "../lib/utils";
import useAuthStore from "../stores/authStore";

const STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in-progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

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

const statusLabels = {
  todo: "To Do",
  "in-progress": "In Progress",
  review: "Review",
  done: "Done",
};

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Task form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: tasks, isLoading: tasksLoading } = useTasks(projectId);
  const { data: allUsers } = useUsers();
  const { user: currentUser } = useAuthStore();

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const addMember = useAddMember();
  const removeMember = useRemoveMember();

  const isAdmin = project?.admins?.some((a) => a._id === currentUser?._id) || project?.creator?._id === currentUser?._id;

  const resetTaskForm = () => {
    setTaskTitle("");
    setTaskDesc("");
    setTaskPriority("medium");
    setTaskDueDate("");
    setTaskAssignee("");
    setEditingTask(null);
  };

  const openCreateTask = () => {
    resetTaskForm();
    setShowTaskModal(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || "");
    setTaskPriority(task.priority);
    setTaskDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
    setTaskAssignee(task.assignedTo?._id || "");
    setShowTaskModal(true);
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    const data = {
      title: taskTitle,
      description: taskDesc,
      priority: taskPriority,
      dueDate: taskDueDate || undefined,
      assignedTo: taskAssignee || undefined,
    };

    if (editingTask) {
      updateTask.mutate(
        { projectId, taskId: editingTask._id, data },
        { onSuccess: () => setShowTaskModal(false) }
      );
    } else {
      createTask.mutate(
        { projectId, data },
        { onSuccess: () => setShowTaskModal(false) }
      );
    }
    resetTaskForm();
  };

  const handleStatusChange = (taskId, newStatus) => {
    updateTask.mutate({ projectId, taskId, data: { status: newStatus } });
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm("Delete this task?")) {
      deleteTask.mutate({ projectId, taskId });
    }
  };

  const handleAddMember = (userId) => {
    addMember.mutate({ projectId, userId });
  };

  const handleRemoveMember = (userId) => {
    if (window.confirm("Remove this member?")) {
      removeMember.mutate({ projectId, userId });
    }
  };

  if (projectLoading) return <PageLoader />;

  const columns = ["todo", "in-progress", "review", "completed"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/projects"
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{project?.name}</h1>
          <p className="text-gray-500">{project?.description}</p>
        </div>
        <Button onClick={() => setShowMemberModal(true)} variant="outline">
          <Users className="w-4 h-4 mr-2" />
          Members
        </Button>
        <Button onClick={openCreateTask}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Kanban Board */}
      {tasksLoading ? (
        <PageLoader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {columns.map((status) => {
            const columnTasks = (tasks || []).filter((t) => t.status === status);
            return (
              <div key={status} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-700">{statusLabels[status]}</h3>
                    <span className="text-sm text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <Card
                      key={task._id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => openEditTask(task)}
                    >
                      <CardBody className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task._id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {task.description && (
                          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
                        )}

                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant={priorityColors[task.priority]}>{task.priority}</Badge>
                          {isOverdue(task.dueDate) && task.status !== "done" && (
                            <Badge variant="danger">Overdue</Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          {task.assignedTo ? (
                            <Avatar name={task.assignedTo.name} size="sm" />
                          ) : (
                            <span className="text-xs text-gray-400">Unassigned</span>
                          )}
                          {task.dueDate && (
                            <span className="text-xs text-gray-400 flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                        </div>

                        {/* Status change */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <select
                            value={task.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleStatusChange(task._id, e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full text-xs px-2 py-1.5 rounded border border-gray-200 bg-white"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </div>
                      </CardBody>
                    </Card>
                  ))}

                  {columnTasks.length === 0 && (
                    <div className="text-center py-8 text-sm text-gray-400">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => { setShowTaskModal(false); resetTaskForm(); }}
        title={editingTask ? "Edit Task" : "Create Task"}
      >
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <Input
            label="Title"
            placeholder="Task title"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
          />
          <Textarea
            label="Description"
            placeholder="Task description..."
            value={taskDesc}
            onChange={(e) => setTaskDesc(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Priority"
              options={PRIORITY_OPTIONS}
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value)}
            />
            <Input
              label="Due Date"
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
            />
          </div>
          <Select
            label="Assign To"
            options={[
              { value: "", label: "Unassigned" },
              ...(project?.members?.map((m) => ({ value: m._id, label: m.name })) || []),
            ]}
            value={taskAssignee}
            onChange={(e) => setTaskAssignee(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => { setShowTaskModal(false); resetTaskForm(); }}>
              Cancel
            </Button>
            <Button type="submit" loading={createTask.isPending || updateTask.isPending}>
              {editingTask ? "Update" : "Create"} Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Members Modal */}
      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Project Members">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Current Members</h4>
            {project?.members?.map((member) => (
              <div key={member._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center gap-3">
                  <Avatar name={member.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {project?.admins?.some((a) => a._id === member._id) && (
                    <Badge variant="primary">Admin</Badge>
                  )}
                  {isAdmin && member._id !== project?.creator?._id && (
                    <button
                      onClick={() => handleRemoveMember(member._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {isAdmin && allUsers && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Add Member</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {allUsers
                  .filter((u) => !project?.members?.some((m) => m._id === u._id))
                  .map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleAddMember(user._id)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 text-left"
                    >
                      <Avatar name={user.name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Plus className="w-4 h-4 text-gray-400 ml-auto" />
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}