import { useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { canAddTeamMember, TEAM_LIMITS } from "@/utils/teamLimits";
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
  const [isAssigningManager, setIsAssigningManager] = useState(false);
  const [isRemovingRole, setIsRemovingRole] = useState(false);
  const [isRemovingManager, setIsRemovingManager] = useState(false);
  const [userLoadingStates, setUserLoadingStates] = useState<
    Record<
      string,
      {
        isAssigningManager?: boolean;
        isRemovingManager?: boolean;
        isAssigningRole?: boolean;
        isRemovingRole?: boolean;
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
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users-with-roles"],
    queryFn: async () => {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, created_at");

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      // Get all team members to understand team relationships
      const { data: teamMembers, error: teamMembersError } = await supabase
        .from("team_members")
        .select("team_id, user_id");

      if (teamMembersError) {
        console.error("Error fetching team members:", teamMembersError);
        throw teamMembersError;
      }

      // Get all team managers to understand who manages which teams
      const { data: teamManagers, error: teamManagersError } = await supabase
        .from("team_managers")
        .select("team_id, user_id");

      if (teamManagersError) {
        console.error("Error fetching team managers:", teamManagersError);
        throw teamManagersError;
      }

      // Create a map of team_id to manager_id
      const teamToManagerMap = new Map<string, string>();
      teamManagers?.forEach((tm) => {
        teamToManagerMap.set(tm.team_id, tm.user_id);
      });

      // Create a map of user_id to manager_id through team relationships
      const userToManagerMap = new Map<string, string>();
      teamMembers?.forEach((member) => {
        const managerId = teamToManagerMap.get(member.team_id);
        if (managerId && managerId !== member.user_id) {
          userToManagerMap.set(member.user_id, managerId);
        }
      });

      // Get manager profiles for users who have managers through teams
      const managerIds = Array.from(userToManagerMap.values());
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
            created_at: string | null;
          }) => {
            // Get manager from teams flow instead of profiles table
            const managerId = userToManagerMap.get(profile.id) || null;
            const manager = managerId ? managerMap.get(managerId) : null;
            const userRoles = roleMap.get(profile.id) || [];

            return {
              id: profile.id,
              email: profile.email,
              first_name: profile.first_name,
              last_name: profile.last_name,
              roles: userRoles,
              manager_id: managerId,
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

      // Check team limits for manager roles
      const managerRoles = Object.keys(TEAM_LIMITS) as Array<
        keyof typeof TEAM_LIMITS
      >;
      if (managerRoles.includes(role as keyof typeof TEAM_LIMITS)) {
        const limitCheck = await canAddTeamMember(userId);

        if (!limitCheck.canAdd) {
          const limitText =
            limitCheck.limit === Infinity
              ? "unlimited"
              : limitCheck.limit.toString();
          throw new Error(
            `Cannot assign ${role} role. Team member limit reached (${limitCheck.currentCount}/${limitText} members).`
          );
        }
      }

      // Insert the role
      const { error } = await supabase
        .from("user_roles")
        .insert([{ user_id: userId, role, email }]);
      if (error) throw error;

      // Create a subscription entry for the role if it's a paid role
      const paidRoles = [
        "agent_pro",
        "manager_pro",
        "manager_pro_gold",
        "manager_pro_platinum",
      ];
      if (paidRoles.includes(role)) {
        try {
          // Check if user already has a subscription for this role
          const { data: existingSubscription } = await supabase
            .from("subscriptions")
            .select("id")
            .eq("user_id", userId)
            .eq("plan_id", role)
            .single();

          if (!existingSubscription) {
            // Create a subscription entry for admin-assigned roles
            const { error: subscriptionError } = await supabase
              .from("subscriptions")
              .insert([
                {
                  user_id: userId,
                  stripe_customer_id: `admin_${userId}`, // Placeholder for admin-assigned roles
                  stripe_subscription_id: `admin_${userId}_${Date.now()}`, // Unique ID for admin-assigned roles
                  plan_id: role,
                  status: "active", // Admin-assigned roles are immediately active
                  current_period_start: new Date().toISOString(),
                  current_period_end: new Date(
                    Date.now() + 365 * 24 * 60 * 60 * 1000
                  ).toISOString(), // 1 year from now
                },
              ]);

            if (subscriptionError) {
              console.error(
                "Error creating subscription for role:",
                subscriptionError
              );
              // Don't throw error here as the role was already assigned successfully
            } else {
              console.log(
                `Successfully created subscription for role ${role} for user ${userId}`
              );
            }
          }
        } catch (subscriptionError) {
          console.error(
            "Error in subscription creation process:",
            subscriptionError
          );
          // Don't throw error here as the role was already assigned successfully
        }
      }

      // Check if this is a manager role and create a team if needed
      const teamCreationRoles = [
        "manager_pro",
        "manager_pro_gold",
        "manager_pro_platinum",
      ];
      let teamCreated = false;

      if (teamCreationRoles.includes(role)) {
        try {
          // Check if user already has a team as a manager
          const { data: existingTeamManager, error: existingTeamError } =
            await supabase
              .from("team_managers")
              .select("team_id")
              .eq("user_id", userId)
              .single();

          if (existingTeamError && existingTeamError.code !== "PGRST116") {
            console.error(
              "Error checking existing team manager:",
              existingTeamError
            );
          } else if (!existingTeamManager) {
            // User doesn't have a team yet, create one
            // Get user profile to create team name
            const { data: userProfile, error: profileError } = await supabase
              .from("profiles")
              .select("first_name, last_name, email")
              .eq("id", userId)
              .single();

            if (profileError) {
              console.error(
                "Error fetching user profile for team creation:",
                profileError
              );
            } else {
              // Create team name based on user's first name
              const teamName = userProfile?.first_name
                ? `${userProfile.first_name}'s Team`
                : userProfile?.email
                ? `${userProfile.email}'s Team`
                : `Team ${userId.slice(0, 8)}`;

              // Create the team
              const { data: newTeam, error: teamError } = await supabase
                .from("teams")
                .insert([{ name: teamName }])
                .select()
                .single();

              if (teamError) {
                console.error("Error creating team:", teamError);
              } else {
                // Create entry in team_managers table
                try {
                  const { error: teamManagerError } = await supabase
                    .from("team_managers")
                    .insert([
                      {
                        team_id: newTeam.id,
                        user_id: userId,
                        role: role,
                      },
                    ]);

                  if (teamManagerError) {
                    console.error(
                      "Error creating team manager entry:",
                      teamManagerError
                    );
                  } else {
                    teamCreated = true;
                  }
                } catch (insertError) {
                  console.error("Error inserting team manager:", insertError);
                }
              }
            }
          }
        } catch (teamCreationError) {
          console.error("Error in team creation process:", teamCreationError);
          // Don't throw error here as the role assignment was successful
        }
      }

      const message = teamCreated
        ? "Role assigned successfully and team created"
        : "Role assigned successfully";

      return { success: true, message, teamCreated };
    },
    onSuccess: async (data) => {
      // Invalidate queries with a small delay to ensure subscription is created first
      await new Promise((resolve) => setTimeout(resolve, 100));

      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      queryClient.invalidateQueries({ queryKey: ["user-teams"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });

      // Force refetch of profile and subscription data
      queryClient.refetchQueries({ queryKey: ["profile"] });

      // Trigger subscription context refresh by dispatching a custom event
      window.dispatchEvent(new CustomEvent("roleChanged"));

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
      setIsRemovingRole(true);
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);
      if (error) throw error;

      // Remove subscription entry if it was admin-assigned
      const paidRoles = [
        "agent_pro",
        "manager_pro",
        "manager_pro_gold",
        "manager_pro_platinum",
      ];
      if (paidRoles.includes(role)) {
        try {
          const { error: subscriptionError } = await supabase
            .from("subscriptions")
            .delete()
            .eq("user_id", userId)
            .eq("plan_id", role)
            .like("stripe_customer_id", "admin_%"); // Only remove admin-assigned subscriptions

          if (subscriptionError) {
            console.error(
              "Error removing subscription for role:",
              subscriptionError
            );
            // Don't throw error here as the role was already removed successfully
          }
        } catch (subscriptionError) {
          console.error(
            "Error in subscription removal process:",
            subscriptionError
          );
          // Don't throw error here as the role was already removed successfully
        }
      }

      return { success: true, message: "Role removed successfully" };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });

      // Trigger subscription context refresh
      window.dispatchEvent(new CustomEvent("roleChanged"));

      toast({
        title: "Success",
        description: data.message || "Role removed successfully",
      });
      setIsRemovingRole(false);
    },
    onError: (error) => {
      console.error("Error removing role:", error);
      toast({
        title: "Error",
        description: "There was a problem removing the role. Please try again.",
        variant: "destructive",
      });
      setIsRemovingRole(false);
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
      setIsAssigningManager(true);

      // Get current user to check permissions
      const {
        data: { user: currentUser },
        error: currentUserError,
      } = await supabase.auth.getUser();

      if (currentUserError || !currentUser) {
        throw new Error("User not authenticated");
      }

      // Check if current user has permission to assign managers
      const { data: currentUserRoles, error: currentUserRoleError } =
        await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", currentUser.id)
          .in("role", [
            "agent_pro",
            "manager",
            "manager_pro",
            "manager_pro_gold",
            "manager_pro_platinum",
            "beta_user",
            "system_admin",
          ]);

      if (currentUserRoleError) {
        console.error(
          "Error checking current user roles:",
          currentUserRoleError
        );
        throw new Error("Failed to verify current user role");
      }

      if (!currentUserRoles?.length) {
        throw new Error("Only Agent Pro users and above can assign managers");
      }

      // If removing manager (managerId is null)
      if (!managerId) {
        setUserLoading(userId, "isRemovingManager", true);
        // Check if user is currently in any team
        const { data: currentTeamMember, error: currentTeamError } =
          await supabase
            .from("team_members")
            .select("team_id")
            .eq("user_id", userId)
            .maybeSingle();

        if (currentTeamError) {
          console.error(
            "Error checking current team membership:",
            currentTeamError
          );
        }

        if (currentTeamMember) {
          // Remove user from current team
          const { error: removeError } = await supabase
            .from("team_members")
            .delete()
            .eq("user_id", userId);

          if (removeError) {
            console.error("Error removing user from team:", removeError);
            throw new Error("Failed to remove user from team");
          }
        }

        return {
          success: true,
          message: "Manager removed successfully",
          data: { userId },
        };
      }

      // Set loading state for manager assignment
      setUserLoading(userId, "isAssigningManager", true);

      // Check if the manager has a valid manager role
      const { data: managerRoles, error: managerRoleError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .eq("user_id", managerId)
        .in("role", [
          "manager",
          "manager_pro",
          "manager_gold",
          "manager_pro_gold",
          "manager_pro_platinum",
        ]);

      if (managerRoleError) {
        console.error("Error checking manager roles:", managerRoleError);
        throw new Error("Failed to verify manager role");
      }

      if (!managerRoles?.length) {
        throw new Error("Selected user does not have a manager role");
      }

      // Check if user already has a manager (is in any team)
      const { data: currentTeamMember, error: currentTeamError } =
        await supabase
          .from("team_members")
          .select("team_id")
          .eq("user_id", userId)
          .maybeSingle();

      if (currentTeamError) {
        console.error(
          "Error checking current team membership:",
          currentTeamError
        );
      }

      if (currentTeamMember) {
        const { error: removeError } = await supabase
          .from("team_members")
          .delete()
          .eq("user_id", userId);

        if (removeError) {
          console.error("Error removing user from current team:", removeError);
          throw new Error("Failed to remove user from current team");
        }
      }

      // Get manager profile for team creation
      const { data: managerProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .eq("id", managerId)
        .single();

      if (profileError) {
        console.error("Error fetching manager profile:", profileError);
        throw new Error("Failed to fetch manager profile");
      }

      // Check if manager has a team
      const { data: teamManagers, error: teamManagerError } = await supabase
        .from("team_managers")
        .select("user_id, role, team_id")
        .eq("user_id", managerId)
        .in("role", [
          "manager_pro",
          "manager_gold",
          "manager_pro_gold",
          "manager_pro_platinum",
        ]);

      if (teamManagerError) {
        console.error("Error checking team manager:", teamManagerError);
        throw new Error("Failed to check manager team");
      }

      // Use the first manager entry if multiple exist
      const teamManager = teamManagers?.[0];
      let managerTeamId = teamManager?.team_id;

      // If manager doesn't have a team, create one
      if (!managerTeamId) {
        // Create team name based on manager's first name
        const teamName = managerProfile.first_name
          ? `${managerProfile.first_name}'s Team`
          : managerProfile.email
          ? `${managerProfile.email}'s Team`
          : `Team ${managerProfile.id.slice(0, 8)}`;

        // Create the team
        const { data: newTeam, error: teamError } = await supabase
          .from("teams")
          .insert([{ name: teamName }])
          .select()
          .single();

        if (teamError) {
          console.error("Error creating team:", teamError);
          throw new Error("Error creating team for manager");
        }

        // Create entry in team_managers table
        const { error: teamManagerError } = await supabase
          .from("team_managers")
          .insert([
            {
              team_id: newTeam.id,
              user_id: managerProfile.id,
              role: managerRoles[0].role, // Use the first manager role
            },
          ]);

        if (teamManagerError) {
          console.error("Error creating team manager entry:", teamManagerError);
          throw new Error("Error setting up manager team");
        }
        managerTeamId = newTeam.id;
      }

      const { canAddTeamMember } = await import("@/utils/teamLimits");
      const teamLimitCheck = await canAddTeamMember(managerProfile.id);

      if (!teamLimitCheck.canAdd) {
        throw new Error("Manager's team is at capacity");
      }

      const { error: insertError } = await supabase
        .from("team_members")
        .insert([
          {
            team_id: managerTeamId,
            user_id: userId,
            role: "agent", // Default role for team members
          },
        ]);

      if (insertError) {
        console.error("Error adding user to team:", insertError);
        throw new Error("Error assigning user to team");
      }

      return {
        success: true,
        message: "Manager assigned successfully",
        data: { team_id: managerTeamId, userId },
      };
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["users-with-roles"] });
      await queryClient.invalidateQueries({ queryKey: ["user-teams"] });
      await queryClient.invalidateQueries({ queryKey: ["team-members"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      await queryClient.invalidateQueries({ queryKey: ["subscription"] });

      // Trigger subscription context refresh
      window.dispatchEvent(new CustomEvent("roleChanged"));

      toast({
        title: "Success",
        description: data.message,
      });
      setIsAssigningManager(false);
      setIsRemovingManager(false);
      // Reset per-user loading states
      if (data.data?.userId) {
        setUserLoading(data.data.userId, "isAssigningManager", false);
        setUserLoading(data.data.userId, "isRemovingManager", false);
      }
    },
    onError: (error, variables) => {
      console.error("Error in manager assignment:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update manager",
        variant: "destructive",
      });
      setIsAssigningManager(false);
      setIsRemovingManager(false);
      // Reset per-user loading state
      setUserLoading(variables.userId, "isAssigningManager", false);
      setUserLoading(variables.userId, "isRemovingManager", false);
    },
  });

  // Memoize the returned functions to prevent unnecessary re-renders
  const assignRole = useCallback(
    (data: { userId: string; email: string | null; role: string }) => {
      assignRoleMutation.mutate(data);
    },
    [assignRoleMutation]
  );

  const removeRole = useCallback(
    (data: { userId: string; role: string }) => {
      removeRoleMutation.mutate(data);
    },
    [removeRoleMutation]
  );

  const assignManager = useCallback(
    (data: { userId: string; managerId: string | null }) => {
      assignManagerMutation.mutate(data);
    },
    [assignManagerMutation]
  );

  return {
    users,
    isLoadingUsers,
    availableRoles,
    assignRole,
    removeRole,
    assignManager,
    isAssigningRole,
    isAssigningManager,
    isRemovingRole,
    isRemovingManager,
    getUserLoading,
  };
};
