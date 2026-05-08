import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../lib/services";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await dashboardService.getOverview();
      return res.data?.data;
    },
    staleTime: 2 * 60 * 1000,
  });
}