import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../lib/services";
import useAuthStore from "../stores/authStore";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const { user, setAuth, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await authService.getMe();
      return res.data?.data;
    },
    enabled: !!localStorage.getItem("accessToken"),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await authService.login(credentials);
      return res.data;
    },
    onSuccess: (data) => {
      const { user, accessToken } = data;
      localStorage.setItem("accessToken", accessToken);
      setAuth(user, accessToken);
      queryClient.setQueryData(["me"], user);
      navigate("/dashboard");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data) => {
      const res = await authService.register(data);
      return res.data;
    },
    onSuccess: (data) => {
      const { user, accessToken } = data;
      localStorage.setItem("accessToken", accessToken);
      setAuth(user, accessToken);
      queryClient.setQueryData(["me"], user);
      navigate("/dashboard");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      storeLogout();
      queryClient.clear();
      navigate("/login");
    },
  });

  return {
    user: data || user,
    isLoading,
    isAdmin: (data || user)?.role === "admin",
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    loginError: loginMutation.error?.response?.data?.message,
    registerError: registerMutation.error?.response?.data?.message,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
}