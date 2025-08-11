import { useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AgentTypes } from "@/types/agent";

export type UserRole = {
  id: string;
  user_id: string;
  email: string | null;
  role: string;
  assigned_at: string;
};

export type UserWithRoles = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  roles: string[];
  manager_id: string | null;
  manager_name: string | null;
  manager_email: string | null;
  created_at: string;
};

export const useRoleManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAssigningRole, setIsAssigningRole] = useState(false);

  // Fetch all users with their roles
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async () => {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, manager_id, created_at");

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      // Fetch managers info separately
      const managerIds = profiles
        .filter((p) => p.manager_id)
        .map((p) => p.manager_id);

      let managers: Array<{
        id: string;
        first_name: string | null;
        last_name: string | null;
        email: string | null;
      }> = [];
      if (managerIds.length > 0) {
        const { data: managersData, error: managersError } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .in("id", managerIds);

        if (managersError) {
          console.error("Error fetching managers:", managersError);
          throw managersError;
        }
        managers = managersData || [];
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

      // Create a map for faster manager lookup
      const managerMap = new Map<
        string,
        {
          id: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
        }
      >();
      managers.forEach((manager) => {
        managerMap.set(manager.id, manager);
      });

      // Process users with optimized data structure
      const usersWithRoles: UserWithRoles[] =
        profiles?.map(
          (profile: {
            id: string;
            email: string | null;
            first_name: string | null;
            last_name: string | null;
            manager_id: string | null;
            created_at: string | null;
          }) => {
            const manager = profile.manager_id
              ? managerMap.get(profile.manager_id)
              : null;
            const userRoles = roleMap.get(profile.id) || [];

            return {
              id: profile.id,
              email: profile.email,
              first_name: profile.first_name,
              last_name: profile.last_name,
              roles: userRoles,
              manager_id: profile.manager_id,
              manager_name: manager
                ? `${manager.first_name} ${manager.last_name}`.trim()
                : null,
              manager_email: manager?.email || null,
              created_at: profile.created_at || null,
            };
          }
        ) || [];

      return usersWithRoles;
    },
    staleTime: 30000, // Cache for 30 seconds instead of 0
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  const availableRoles = useMemo(() => Object.values(AgentTypes), []);
  const assignRoleMutation = useMutation({
    mutationFn: async ({
      userId,
      email,
      role,
    }: {
      userId: string;
      email: string | null;
      role: string;
    }) => {
      setIsAssigningRole(true);
      const { data: existingRole, error: checkError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .eq("role", role)
        .single();
      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }
      if (existingRole) {
        return { success: true, message: "User already has this role" };
      }
      const { error } = await supabase
        .from("user_roles")
        .insert([{ user_id: userId, role, email }]);
      if (error) throw error;
      return { success: true, message: "Role assigned successfully" };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      toast({
        title: "Success",
        description: data.message || "Role assigned successfully",
      });
      setIsAssigningRole(false);
    },
    onError: (error) => {
      console.error("Error assigning role:", error);
      toast({
        title: "Error",
        description:
          "There was a problem assigning the role. Please try again.",
        variant: "destructive",
      });
      setIsAssigningRole(false);
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);
      if (error) throw error;
      return { success: true, message: "Role removed successfully" };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      toast({
        title: "Success",
        description: data.message || "Role removed successfully",
      });
    },
    onError: (error) => {
      console.error("Error removing role:", error);
      toast({
        title: "Error",
        description: "There was a problem removing the role. Please try again.",
        variant: "destructive",
      });
    },
  });

  const assignManagerMutation = useMutation({
    mutationFn: async ({
      userId,
      managerId,
    }: {
      userId: string;
      managerId: string | null;
    }) => {
      // If removing manager, skip validation
      if (!managerId) {
        const { data: updateResult, error: updateError } = await supabase
          .from("profiles")
          .update({
            manager_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)
          .select()
          .single();

        if (updateError) throw updateError;
        return {
          success: true,
          message: "Manager removed successfully",
          data: updateResult,
        };
      }

      // Check if the selected user has a manager role
      const { data: managerRoles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", managerId)
        .in("role", [
          AgentTypes.MANAGER,
          AgentTypes.MANAGER_PRO,
          AgentTypes.MANAGER_PRO_GOLD,
          AgentTypes.MANAGER_PRO_PLATINUM,
        ]);

      if (roleError) {
        console.error("Error checking manager roles:", roleError);
        throw new Error("Failed to verify manager role");
      }

      if (!managerRoles?.length) {
        throw new Error("Selected user does not have a manager role");
      }

      // Extract all roles from the managerRoles array
      const roles = managerRoles.map((roleObj) => roleObj.role);

      // Team size limits for different roles
      const teamSizeLimits = {
        manager: 5,
        manager_pro: 20,
        manager_pro_gold: 50,
        manager_pro_platinum: Infinity,
      } as const;

      // Determine the maximum limit based on all roles
      const applicableLimits = roles
        .map((role) => teamSizeLimits[role as keyof typeof teamSizeLimits])
        .filter((limit) => limit !== undefined);

      const teamSizeLimit = Math.max(...applicableLimits);

      // Fetch current team size
      const { data: currentTeam, error: teamError } = await supabase
        .from("profiles")
        .select("id")
        .eq("manager_id", managerId);

      if (teamError) {
        console.error("Error checking team size:", teamError);
        throw new Error("Failed to check team size");
      }

      const currentTeamSize = currentTeam?.length || 0;

      if (currentTeamSize >= teamSizeLimit) {
        throw new Error(
          `Manager has reached their team size limit of ${teamSizeLimit} members`
        );
      }

      // If all validations pass, proceed with the update
      const { data: updateResult, error: updateError } = await supabase
        .from("profiles")
        .update({
          manager_id: managerId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating profile:", updateError);
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }

      return {
        success: true,
        message: "Manager assigned successfully",
        data: updateResult,
      };
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });

      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error) => {
      console.error("Error in manager assignment:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update manager",
        variant: "destructive",
      });
    },
  });

  // Memoize the returned functions to prevent unnecessary re-renders
  const assignRole = useCallback(assignRoleMutation.mutate, [
    assignRoleMutation.mutate,
  ]);
  const removeRole = useCallback(removeRoleMutation.mutate, [
    removeRoleMutation.mutate,
  ]);
  const assignManager = useCallback(assignManagerMutation.mutate, [
    assignManagerMutation.mutate,
  ]);

  return {
    users,
    isLoadingUsers,
    availableRoles,
    assignRole,
    removeRole,
    assignManager,
    isAssigningRole,
  };
};
