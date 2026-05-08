import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../lib/services";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await userService.getAll();
      return res.data?.data || [];
    },
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }) => userService.updateRole(userId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId) => userService.delete(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}