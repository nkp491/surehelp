
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "@/types/team";
import { useToast } from "@/hooks/use-toast";

export const useManagerTeam = (managerId?: string) => {
  const { toast } = useToast();

  // Get all team members where manager_id = managerId
  const { data: teamMembers, isLoading, error, refetch } = useQuery({
    queryKey: ['manager-team', managerId],
    queryFn: async () => {
      if (!managerId) return [];

      console.log("Fetching team members for manager:", managerId);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('manager_id', managerId);

      if (error) {
        console.error("Error fetching team members:", error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} team members for manager:`, managerId);
      
      // Transform the data to match our TeamMember type instead of Profile
      // This ensures compatibility with the team filtering functionality
      return data.map(profile => ({
        id: profile.id,
        user_id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        profile_image_url: profile.profile_image_url,
        // For other TeamMember fields, we set defaults
        team_id: "", // This will be populated from team_members table if needed
        role: profile.role || "",
        created_at: profile.created_at,
        updated_at: profile.updated_at
      })) as TeamMember[];
    },
    enabled: !!managerId,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes (reduced from default)
    refetchOnWindowFocus: true, // Refresh data when window regains focus
  });

  // Get team members by team ID
  const getTeamMembersByTeam = async (teamId: string) => {
    try {
      console.log("Fetching team members for team:", teamId);
      
      // First get the team members from the team_members table
      const { data: teamMembersData, error: teamMembersError } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId);
        
      if (teamMembersError) throw teamMembersError;
      
      if (!teamMembersData || teamMembersData.length === 0) {
        console.log("No team members found for team:", teamId);
        return [];
      }
      
      // Get the user IDs from the team members
      const userIds = teamMembersData.map(member => member.user_id);
      
      // Fetch the profile information for those users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
        
      if (profilesError) throw profilesError;
      
      // Combine the team members data with the profiles data
      const result = teamMembersData.map(member => {
        const profile = profilesData?.find(p => p.id === member.user_id);
        return {
          id: member.id,
          team_id: member.team_id,
          user_id: member.user_id,
          role: member.role,
          created_at: member.created_at,
          updated_at: member.updated_at,
          // Add profile information if available
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null,
          email: profile?.email || null,
          profile_image_url: profile?.profile_image_url || null
        };
      }) as TeamMember[];
      
      console.log(`Found ${result.length} members in team:`, teamId);
      return result;
    } catch (error) {
      console.error("Error fetching team members by team:", error);
      return [];
    }
  };

  // Update a team member's manager
  const updateTeamMemberManager = async (memberId: string, newManagerId: string | null) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ manager_id: newManagerId })
        .eq('id', memberId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: newManagerId 
          ? "Team member has been assigned to a new manager." 
          : "Team member has been removed from your team.",
      });
      
      refetch();
      return true;
    } catch (error: any) {
      console.error("Error updating team member:", error.message);
      toast({
        title: "Error",
        description: "Failed to update team member. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Get team members under managers that have this manager as their manager
  const getNestedTeamMembers = async () => {
    if (!managerId) return [];
    
    try {
      // First get managers who have this manager as their manager
      const { data: subManagers, error: subManagerError } = await supabase
        .from('profiles')
        .select('*')
        .eq('manager_id', managerId)
        .or(`role.eq.manager_pro,role.eq.manager_pro_gold,role.eq.manager_pro_platinum`);
        
      if (subManagerError) throw subManagerError;
      
      if (!subManagers || subManagers.length === 0) return [];
      
      console.log(`Found ${subManagers.length} sub-managers for manager:`, managerId);
      
      // Get the IDs of all sub-managers
      const subManagerIds = subManagers.map(manager => manager.id);
      
      // Now get all team members who have any of these sub-managers as their manager
      const { data: nestedMembers, error: membersError } = await supabase
        .from('profiles')
        .select('*')
        .in('manager_id', subManagerIds);
        
      if (membersError) throw membersError;
      
      console.log(`Found ${nestedMembers?.length || 0} nested team members for sub-managers`);
      
      // Transform the data to match our TeamMember type for consistency
      return nestedMembers.map(profile => ({
        id: profile.id,
        user_id: profile.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        profile_image_url: profile.profile_image_url,
        team_id: "", // This would need to be joined from team_members table
        role: profile.role || "",
        created_at: profile.created_at,
        updated_at: profile.updated_at
      })) as TeamMember[];
    } catch (error) {
      console.error("Error fetching nested team members:", error);
      return [];
    }
  };
  
  // Get nested team members query
  const { 
    data: nestedTeamMembers, 
    isLoading: isLoadingNested, 
    refetch: refetchNested 
  } = useQuery({
    queryKey: ['nested-team-members', managerId],
    queryFn: getNestedTeamMembers,
    enabled: !!managerId && (managerId?.length > 0),
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
  });

  // Get team members by team ID query
  const getTeamMembersByTeamQuery = (teamId?: string) => {
    return useQuery({
      queryKey: ['team-members-by-team', teamId],
      queryFn: () => getTeamMembersByTeam(teamId!),
      enabled: !!teamId && teamId.length > 0,
      staleTime: 1000 * 60 * 2,
    });
  };

  // Combined refetch function
  const refetchAll = async () => {
    await refetch();
    await refetchNested();
  };

  return {
    teamMembers,
    nestedTeamMembers,
    isLoading: isLoading || isLoadingNested,
    error,
    updateTeamMemberManager,
    refetch: refetchAll,
    getTeamMembersByTeam,
    getTeamMembersByTeamQuery
  };
};
