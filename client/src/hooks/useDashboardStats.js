import { useQuery } from "@tanstack/react-query";
import api, { documentService } from "@/services/api";

/**
 * Hook to fetch dashboard statistics and profile info.
 */
export const useDashboardStats = () => {
    return useQuery({
        queryKey: ["dashboard-stats"],
        queryFn: async () => {
            const [profileRes, statsRes] = await Promise.all([
                api.get('/api/profile/me'),
                documentService.getDashboardStats()
            ]);

            const profile = profileRes.data?.data;
            const stats = statsRes.data;

            return { profile, stats };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false
    });
};
