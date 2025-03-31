
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook that provides cached user roles with React Query
 * to reduce redundant Supabase queries across page navigation
 */
export function useRolesCache() {
  const { data: userRoles, isLoading, refetch } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return [];
        }

        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
          
        return userRoles?.map(r => r.role) || [];
      } catch (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
  });

  return {
    userRoles: userRoles || [],
    isLoadingRoles: isLoading,
    refetchRoles: refetch
  };
}
