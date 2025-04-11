import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      console.log('Fetching users and roles...');
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, manager_id, created_at");

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Fetched profiles with dates:', profiles.map(p => ({
        email: p.email,
        created_at: p.created_at
      })));

      // Fetch managers info separately
      const managerIds = profiles
        .filter(p => p.manager_id)
        .map(p => p.manager_id);

      const { data: managers, error: managersError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", managerIds);

      if (managersError) {
        console.error('Error fetching managers:', managersError);
        throw managersError;
      }

      console.log('Fetched managers:', managers);

      // Then get all role assignments
      const { data: roleAssignments, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) {
        console.error('Error fetching role assignments:', rolesError);
        throw rolesError;
      }

      console.log('Fetched role assignments:', roleAssignments);

      // Combine the data to create users with their roles
      const usersWithRoles: UserWithRoles[] = profiles.map((profile: any) => {
        const userRoles = roleAssignments.filter(
          (role: any) => role.user_id === profile.id
        );
        const manager = profile.manager_id ? managers?.find(m => m.id === profile.manager_id) : null;
        
        console.log('Processing user profile:', {
          email: profile.email,
          created_at: profile.created_at,
          created_at_type: typeof profile.created_at
        });
        
        return {
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name,
          last_name: profile.last_name,
          roles: userRoles.map((r: any) => r.role),
          manager_id: profile.manager_id,
          manager_name: manager ? `${manager.first_name} ${manager.last_name}`.trim() : null,
          manager_email: manager?.email || null,
          created_at: profile.created_at || null
        };
      });

      console.log('Processed users with roles:', usersWithRoles);
      return usersWithRoles;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch available roles
  const availableRoles = [
    "agent",
    "agent_pro",
    "manager_pro",
    "manager_pro_gold",
    "manager_pro_platinum",
    "beta_user",
    "system_admin"
  ];

  // Assign a role to a user
  const assignRoleMutation = useMutation({
    mutationFn: async ({ userId, email, role }: { userId: string; email: string | null; role: string }) => {
      setIsAssigningRole(true);
      
      // Check if user already has this role
      const { data: existingRole, error: checkError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", userId)
        .eq("role", role)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 means no rows returned, which is expected if user doesn't have the role
        throw checkError;
      }

      // If role already exists, no need to assign again
      if (existingRole) {
        return { success: true, message: "User already has this role" };
      }

      // Assign the role
      const { error } = await supabase
        .from("user_roles")
        .insert([{ user_id: userId, role, email }]);

      if (error) throw error;

      return { success: true, message: "Role assigned successfully" };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
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
        description: "There was a problem assigning the role. Please try again.",
        variant: "destructive",
      });
      setIsAssigningRole(false);
    }
  });

  // Remove a role from a user
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
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
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
    }
  });

  // Assign manager to a user
  const assignManagerMutation = useMutation({
    mutationFn: async ({ userId, managerId }: { userId: string; managerId: string | null }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ manager_id: managerId })
        .eq("id", userId);

      if (error) throw error;

      return { success: true, message: managerId ? "Manager assigned successfully" : "Manager removed successfully" };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
      toast({
        title: "Success",
        description: data.message,
      });
    },
    onError: (error) => {
      console.error("Error assigning manager:", error);
      toast({
        title: "Error",
        description: "There was a problem updating the manager. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    users,
    isLoadingUsers,
    availableRoles,
    assignRole: assignRoleMutation.mutate,
    removeRole: removeRoleMutation.mutate,
    assignManager: assignManagerMutation.mutate,
    isAssigningRole
  };
};
