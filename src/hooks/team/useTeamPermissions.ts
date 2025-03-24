
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { hasManagerPermission } from "@/utils/team/managerTierUtils";

/**
 * Hook to check team-related permissions
 */
export const useTeamPermissions = () => {
  const { hasSystemAdminRole } = useRoleCheck();
  
  // Check if user is the manager of a team
  const isTeamManager = useCallback(async (teamId: string) => {
    if (hasSystemAdminRole) return true;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      // Use the RPC function for checking team manager status
      const { data, error } = await supabase.rpc('is_team_manager', {
        check_team_id: teamId
      });
      
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error("Error checking team manager status:", error);
      return false;
    }
  }, [hasSystemAdminRole]);
  
  // Check if a user is a system admin
  const isSystemAdmin = useCallback(async () => {
    if (hasSystemAdminRole) return true;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      // Check user_roles table
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', 'system_admin')
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error("Error checking system admin status:", error);
      return false;
    }
  }, [hasSystemAdminRole]);
  
  // Check if user has a manager tier role (manager_pro, manager_pro_gold, etc.)
  const hasManagerTier = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      // Check user_roles table for any manager role
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .like('role', 'manager_pro%')
        .maybeSingle();
      
      if (error) throw error;
      return !!data || hasSystemAdminRole;
    } catch (error) {
      console.error("Error checking manager tier:", error);
      return false;
    }
  }, [hasSystemAdminRole]);
  
  // Check if user is the owner/creator of a team
  const isTeamOwner = useCallback(async (teamId: string) => {
    if (hasSystemAdminRole) return true;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      // Find user's role in the team
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single();
      
      if (error) return false;
      
      // Only platinum managers can be considered "owners" 
      // with full permissions over the team
      return data.role === 'manager_pro_platinum';
    } catch (error) {
      console.error("Error checking team owner status:", error);
      return false;
    }
  }, [hasSystemAdminRole]);
  
  // Check if user can view team hierarchy
  const canViewTeamHierarchy = useCallback((teamId: string) => {
    return async () => {
      if (hasSystemAdminRole) return true;
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;
        
        // Find user's role in the team
        const { data, error } = await supabase
          .from('team_members')
          .select('role')
          .eq('team_id', teamId)
          .eq('user_id', user.id)
          .single();
        
        if (error) return false;
        
        // Check if the role has hierarchy viewing permission
        return hasManagerPermission(data.role, 'canViewHierarchy');
      } catch (error) {
        console.error("Error checking team hierarchy permission:", error);
        return false;
      }
    };
  }, [hasSystemAdminRole]);
  
  // Check if user can edit team settings
  const canEditTeamSettings = useCallback((teamId: string) => {
    return async () => {
      if (hasSystemAdminRole) return true;
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;
        
        // Find user's role in the team
        const { data, error } = await supabase
          .from('team_members')
          .select('role')
          .eq('team_id', teamId)
          .eq('user_id', user.id)
          .single();
        
        if (error) return false;
        
        // Any manager can edit team settings, but with different levels of access
        return data.role.startsWith('manager_pro');
      } catch (error) {
        console.error("Error checking team settings permission:", error);
        return false;
      }
    };
  }, [hasSystemAdminRole]);

  return {
    isTeamManager,
    isSystemAdmin,
    hasManagerTier,
    isTeamOwner,
    canViewTeamHierarchy,
    canEditTeamSettings
  };
};
