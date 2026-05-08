import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "../lib/services";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await projectService.getAll();
      return res.data?.data || [];
    },
  });
}

export function useProject(id) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      const res = await projectService.getById(id);
      return res.data?.data;
    },
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => projectService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => projectService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["projects"] }),
  });
}

export function useAddMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId }) => projectService.addMember(projectId, userId),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["project", vars.projectId] }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, userId }) => projectService.removeMember(projectId, userId),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["project", vars.projectId] }),
  });
}