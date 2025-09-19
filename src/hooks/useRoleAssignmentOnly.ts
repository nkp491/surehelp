import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type UserWithRoles = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  roles: string[];
  created_at: string;
};

export const useRoleAssignmentOnly = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userLoadingStates, setUserLoadingStates] = useState<
    Record<
      string,
      {
        isAssigningRole?: boolean;
      }
    >
  >({});

  // Helper functions for per-user loading states
  const setUserLoading = useCallback(
    (
      userId: string,
      loadingType: keyof (typeof userLoadingStates)[string],
      isLoading: boolean
    ) => {
      setUserLoadingStates((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          [loadingType]: isLoading,
        },
      }));
    },
    []
  );

  const getUserLoading = useCallback(
    (userId: string, loadingType: keyof (typeof userLoadingStates)[string]) => {
      return userLoadingStates[userId]?.[loadingType] || false;
    },
    [userLoadingStates]
  );

  // Fetch all users with their roles
  const { data: users, isLoading: isLoadingUsers, error: queryError } = useQuery({
    queryKey: ["users-with-roles-only"],
    queryFn: async () => {
      // Check if current user has system_admin role first
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("Not authenticated");
      }

      const { data: adminRoles, error: adminError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.session.user.id)
        .eq("role", "system_admin");

      if (adminError) {
        console.error("Error checking admin role:", adminError);
        throw adminError;
      }

      if (!adminRoles?.length) {
        throw new Error("Access denied: System admin role required");
      }

      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, created_at");

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      // Get all role assignments
      const { data: roleAssignments, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) {
        console.error("Error fetching role assignments:", rolesError);
        throw rolesError;
      }

      // Create a map for faster role lookup
      const roleMap = new Map<string, string[]>();
      roleAssignments?.forEach((role: { user_id: string; role: string }) => {
        const existing = roleMap.get(role.user_id) || [];
        roleMap.set(role.user_id, [...existing, role.role]);
      });

      // Process users with roles
      const usersWithRoles: UserWithRoles[] =
        profiles?.map(
          (profile: {
            id: string;
            email: string | null;
            first_name: string | null;
            last_name: string | null;
            created_at: string | null;
          }) => {
            const userRoles = roleMap.get(profile.id) || [];

            return {
              id: profile.id,
              email: profile.email,
              first_name: profile.first_name,
              last_name: profile.last_name,
              roles: userRoles,
              created_at: profile.created_at || "",
            };
          }
        ) || [];

      return usersWithRoles;
    },
  });

  // Available roles for assignment
  const availableRoles = [
    "agent",
    "agent_pro", 
    "manager",
    "manager_pro",
    "manager_gold",
    "manager_pro_gold",
    "manager_pro_platinum",
    "beta_user",
    "system_admin",
  ];

  // Assign role mutation
  const assignRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: string;
    }) => {
      // Check if current user has system_admin role
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        throw new Error("Not authenticated");
      }

      const { data: adminRoles, error: adminError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.session.user.id)
        .eq("role", "system_admin");

      if (adminError) {
        console.error("Error checking admin role:", adminError);
        throw adminError;
      }

      if (!adminRoles?.length) {
        throw new Error("Access denied: System admin role required to assign roles");
      }

      // Check if user already has this role
      const { data: existingRole, error: existingRoleError } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .eq("role", role)
        .maybeSingle();

      if (existingRoleError) {
        console.error("Error checking existing role:", existingRoleError);
        throw existingRoleError;
      }

      if (existingRole) {
        throw new Error("User already has this role");
      }

      // Insert the new role
      const { error: insertError } = await supabase
        .from("user_roles")
        .insert([{ user_id: userId, role }]);

      if (insertError) {
        console.error("Error assigning role:", insertError);
        throw insertError;
      }

      return { success: true, message: "Role assigned successfully" };
    },
    onSuccess: async (data, variables) => {
      // Invalidate and refetch the users data to reflect the new role
      await queryClient.invalidateQueries({ queryKey: ["users-with-roles-only"] });
      
      toast({
        title: "Success",
        description: data.message,
      });
      
      setUserLoading(variables.userId, 'isAssigningRole', false);
    },
    onError: (error, variables) => {
      console.error("Error assigning role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive",
      });
      setUserLoading(variables.userId, 'isAssigningRole', false);
    },
  });

  // Memoize the assign role function
  const assignRole = useCallback(
    (data: { userId: string; role: string }) => {
      setUserLoading(data.userId, 'isAssigningRole', true);
      assignRoleMutation.mutate(data);
    },
    [assignRoleMutation, setUserLoading]
  );

  return {
    users,
    isLoadingUsers,
    error: queryError,
    availableRoles,
    assignRole,
    getUserLoading,
  };
};
