
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TeamNode, TeamHierarchy } from "@/types/team-hierarchy";
import { TeamMember } from "@/types/team";
import { useTeamPermissions } from "./useTeamPermissions";

export const useTeamHierarchy = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { canViewTeamHierarchy } = useTeamPermissions();

  // Function to build team hierarchy from flat data
  const buildHierarchy = useCallback((
    teams: any[], 
    relationships: any[], 
    members: any[]
  ): TeamHierarchy | null => {
    if (!teams.length) return null;

    // Create a map of team IDs to team nodes
    const teamMap = new Map<string, TeamNode>();
    
    // Initialize all teams as nodes
    teams.forEach(team => {
      teamMap.set(team.id, {
        ...team,
        children: [],
        members: [],
        level: 0,
        isExpanded: false
      });
    });
    
    // Group members by team
    members.forEach(member => {
      const team = teamMap.get(member.team_id);
      if (team) {
        if (!team.members) team.members = [];
        team.members.push(member);
        
        // Set the manager if the role is manager_pro*
        if (member.role && member.role.startsWith('manager_pro')) {
          team.manager = member;
        }
      }
    });

    // Create parent-child relationships
    const childrenMap = new Map<string, string[]>();
    relationships.forEach(rel => {
      if (!childrenMap.has(rel.parent_team_id)) {
        childrenMap.set(rel.parent_team_id, []);
      }
      childrenMap.get(rel.parent_team_id)!.push(rel.child_team_id);
      
      // Set parent team reference
      const childTeam = teamMap.get(rel.child_team_id);
      if (childTeam) {
        childTeam.parentTeamId = rel.parent_team_id;
      }
    });
    
    // Build the hierarchical structure
    childrenMap.forEach((childIds, parentId) => {
      const parentTeam = teamMap.get(parentId);
      if (parentTeam) {
        childIds.forEach(childId => {
          const childTeam = teamMap.get(childId);
          if (childTeam) {
            if (!parentTeam.children) parentTeam.children = [];
            parentTeam.children.push(childTeam);
          }
        });
      }
    });
    
    // Find root teams (teams with no parent)
    const rootTeams: TeamNode[] = [];
    teamMap.forEach(team => {
      if (!team.parentTeamId) {
        rootTeams.push(team);
      }
    });
    
    // Assign levels based on hierarchy
    const assignLevels = (node: TeamNode, level: number) => {
      node.level = level;
      if (node.children) {
        node.children.forEach(child => assignLevels(child, level + 1));
      }
    };
    
    rootTeams.forEach(root => assignLevels(root, 0));
    
    // Calculate aggregate metrics
    const calculateMetrics = (node: TeamNode): TeamAggregateMetrics => {
      const baseMetrics = {
        totalLeads: 0,
        totalCalls: 0,
        totalContacts: 0,
        totalScheduled: 0,
        totalSits: 0,
        totalSales: 0,
        averageAP: 0,
        teamCount: 1, // Count this team
        memberCount: node.members?.length || 0
      };
      
      // If there are no children, return base metrics
      if (!node.children || node.children.length === 0) {
        return baseMetrics;
      }
      
      // Recursively calculate metrics for all children
      const childMetrics = node.children.map(child => calculateMetrics(child));
      
      // Combine all metrics
      const aggregateMetrics = childMetrics.reduce((acc, curr) => {
        return {
          totalLeads: acc.totalLeads + curr.totalLeads,
          totalCalls: acc.totalCalls + curr.totalCalls,
          totalContacts: acc.totalContacts + curr.totalContacts,
          totalScheduled: acc.totalScheduled + curr.totalScheduled,
          totalSits: acc.totalSits + curr.totalSits,
          totalSales: acc.totalSales + curr.totalSales,
          averageAP: 0, // Will calculate after
          teamCount: acc.teamCount + curr.teamCount,
          memberCount: acc.memberCount + curr.memberCount
        };
      }, baseMetrics);
      
      // Calculate weighted average AP
      const totalMembers = aggregateMetrics.memberCount;
      if (totalMembers > 0) {
        aggregateMetrics.averageAP = 
          (baseMetrics.averageAP * baseMetrics.memberCount + 
           childMetrics.reduce((sum, curr) => sum + curr.averageAP * curr.memberCount, 0)) / totalMembers;
      }
      
      node.metrics = aggregateMetrics;
      return aggregateMetrics;
    };
    
    // Apply metrics to all root teams
    rootTeams.forEach(root => calculateMetrics(root));
    
    // Return the hierarchy with the first root team as the root
    // In most cases, we'll query for a specific team so there will be only one root
    return {
      rootTeam: rootTeams[0] || null,
      allTeams: Array.from(teamMap.values()),
      allMembers: members
    };
  }, []);

  // Function to fetch team hierarchy data
  const fetchHierarchy = useCallback(async (rootTeamId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the root team and its details
      const { data: rootTeam, error: rootTeamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', rootTeamId)
        .single();
      
      if (rootTeamError) throw rootTeamError;
      
      // Fetch all teams that are related to this team (child teams)
      const { data: relationships, error: relError } = await supabase
        .from('team_relationships')
        .select('*')
        .or(`parent_team_id.eq.${rootTeamId},child_team_id.eq.${rootTeamId}`);
      
      if (relError) throw relError;
      
      // Get all team IDs involved in the hierarchy
      const teamIds = new Set<string>([rootTeamId]);
      relationships.forEach(rel => {
        teamIds.add(rel.parent_team_id);
        teamIds.add(rel.child_team_id);
      });
      
      // Fetch all teams in the hierarchy
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .in('id', Array.from(teamIds));
      
      if (teamsError) throw teamsError;
      
      // Fetch all members for these teams
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles:user_id (
            id,
            first_name,
            last_name,
            email,
            profile_image_url
          )
        `)
        .in('team_id', Array.from(teamIds));
      
      if (membersError) throw membersError;
      
      // Transform members data to include profile information
      const transformedMembers = members.map(member => ({
        ...member,
        first_name: member.profiles?.first_name,
        last_name: member.profiles?.last_name,
        email: member.profiles?.email,
        profile_image_url: member.profiles?.profile_image_url
      }));
      
      // Build the hierarchy
      const hierarchy = buildHierarchy(teams, relationships, transformedMembers);
      
      return hierarchy;
    } catch (error: any) {
      console.error("Error fetching team hierarchy:", error);
      setError(error.message || "Failed to load team hierarchy");
      return null;
    } finally {
      setLoading(false);
    }
  }, [buildHierarchy]);

  // Query function to fetch and cache hierarchy data
  const useHierarchyQuery = (teamId?: string) => {
    return useQuery({
      queryKey: ['team-hierarchy', teamId],
      queryFn: () => fetchHierarchy(teamId!),
      enabled: !!teamId && canViewTeamHierarchy(teamId),
    });
  };

  return {
    fetchHierarchy,
    useHierarchyQuery,
    buildHierarchy,
    loading,
    error,
    canViewHierarchy: canViewTeamHierarchy
  };
};
