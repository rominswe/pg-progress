import { useQuery } from "@tanstack/react-query";
import { progressService } from "@/services/api";

/**
 * Hook to fetch students for the current supervisor.
 */
export const useMyStudents = () => {
    return useQuery({
        queryKey: ["my-students"],
        queryFn: async () => {
            const data = await progressService.getMyStudents();
            // API response structure: { success: true, data: { students: [...] } }
            // progressService.getMyStudents() returns the body aka { success, data }
            return data.data?.students || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes fresh
        retry: 1,
        refetchOnWindowFocus: false
    });
};
