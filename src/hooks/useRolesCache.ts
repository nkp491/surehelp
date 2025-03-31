
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook that provides cached user roles with React Query
 * to reduce redundant Supabase queries across page navigation
 */
export function useRolesCache() {
  const queryClient = useQueryClient();
  
  const { data: userRoles, isLoading, refetch } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      console.log("Fetching user roles from database...");
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log("No authenticated user found, returning empty roles array");
          return [];
        }

        console.log("Querying user_roles for user:", user.id);
        const { data: userRoles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        if (error) {
          console.error("Error fetching user roles:", error);
          return [];
        }
        
        const roles = userRoles?.map(r => r.role) || [];
        console.log("Fetched roles:", roles);
        return roles;
      } catch (error) {
        console.error("Error fetching user roles:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
  });

  const invalidateAndRefetch = async () => {
    console.log("Invalidating and refetching roles cache");
    await queryClient.invalidateQueries({ queryKey: ['user-roles'] });
    return refetch();
  };

  return {
    userRoles: userRoles || [],
    isLoadingRoles: isLoading,
    refetchRoles: invalidateAndRefetch
  };
}
