import { useState } from "react";
import { Link } from "react-router-dom";
import { useProjects, useCreateProject, useDeleteProject } from "../hooks/useProjects";
import { Card, CardBody, Button, Modal, Input, Textarea, EmptyState, PageLoader, Badge } from "../components/ui";
import { Plus, FolderKanban, Trash2, Users, ExternalLink } from "lucide-react";

export default function Projects() {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: projects, isLoading } = useProjects();
  const createMutation = useCreateProject();
  const deleteMutation = useDeleteProject();

  const handleCreate = (e) => {
    e.preventDefault();
    createMutation.mutate(
      { name, description },
      {
        onSuccess: () => {
          setShowCreate(false);
          setName("");
          setDescription("");
        },
      }
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this project and all its tasks?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500">Manage your team projects</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {projects?.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<FolderKanban className="w-16 h-16" />}
              title="No projects yet"
              description="Create your first project to start managing tasks with your team."
              action={
                <Button onClick={() => setShowCreate(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              }
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects?.map((project) => (
            <Card key={project._id} className="hover:shadow-md transition-shadow">
              <CardBody>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-primary-100">
                    <FolderKanban className="w-5 h-5 text-primary-600" />
                  </div>
                  <button
                    onClick={() => handleDelete(project._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {project.description || "No description"}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    {project.members?.length || 0} members
                  </div>
                  <Link
                    to={`/projects/${project._id}`}
                    className="flex items-center text-sm text-primary-600 hover:underline font-medium"
                  >
                    Open
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g., Website Redesign"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Textarea
            label="Description"
            placeholder="Brief description of the project..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}