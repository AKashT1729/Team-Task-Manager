import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "../lib/services";

export function useTasks(projectId) {
  return useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const res = await taskService.getByProject(projectId);
      return res.data?.data || [];
    },
    enabled: !!projectId,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }) => taskService.create(projectId, data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["tasks", vars.projectId] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, taskId, data }) => taskService.update(projectId, taskId, data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["tasks", vars.projectId] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, taskId }) => taskService.delete(projectId, taskId),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["tasks", vars.projectId] }),
  });
}