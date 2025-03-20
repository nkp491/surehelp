import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Team, TeamMember } from "@/types/team";
import { TeamHierarchyNode, TeamRelationship } from "@/types/teamHierarchy";
import { MetricCount } from "@/types/metrics";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { useTeamMetrics } from "@/hooks/useTeamMetrics";

export const useTeamHierarchy = (rootTeamId?: string) => {
  const { hasRequiredRole, userRoles } = useRoleCheck();
  const { teams } = useTeamManagement();
  
  // Determine the hierarchy access level based on user role
  const hasPlatinumAccess = hasRequiredRole(['manager_pro_platinum', 'beta_user', 'system_admin']);
  const hasGoldAccess = hasRequiredRole(['manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin']);
  const hasManagerAccess = hasRequiredRole(['manager_pro', 'manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin']);
  
  // Maximum hierarchy depth based on user role
  const maxHierarchyDepth = hasPlatinumAccess ? Infinity : (hasGoldAccess ? 2 : 1);

  // Query for team relationships
  const { data: teamRelationships, isLoading: isLoadingRelationships } = useQuery({
    queryKey: ['team-relationships'],
    queryFn: async (): Promise<TeamRelationship[]> => {
      // In production, fetch from Supabase
      // For now, we'll use mock data
      return mockTeamRelationships;
    },
    enabled: hasManagerAccess
  });

  // Build team hierarchy
  const buildTeamHierarchy = (
    teams: Team[], 
    relationships: TeamRelationship[], 
    rootId?: string, 
    level: number = 0,
    visited: Set<string> = new Set()
  ): TeamHierarchyNode[] => {
    // Prevent circular references
    if (rootId && visited.has(rootId)) {
      return [];
    }
    
    if (rootId) {
      visited.add(rootId);
    }
    
    // If we've reached max depth, don't go further
    if (level >= maxHierarchyDepth) {
      return [];
    }
    
    // Get all teams that are either root level (no parent) or are children of the specified parent
    const relevantTeams = teams.filter(team => {
      if (!rootId) {
        // If no rootId, only return teams with no parents (top level)
        return !relationships.some(rel => rel.childTeamId === team.id);
      } else {
        // Otherwise return direct children of specified root
        return relationships.some(rel => 
          rel.parentTeamId === rootId && rel.childTeamId === team.id
        );
      }
    });
    
    // Build the hierarchy nodes
    return relevantTeams.map(team => {
      const childTeams = buildTeamHierarchy(
        teams, 
        relationships, 
        team.id, 
        level + 1,
        new Set(visited)
      );
      
      return {
        team,
        parentTeamId: rootId,
        childTeams,
        members: [], // Placeholder, would be populated in production
        level,
      };
    });
  };

  // Query to get the complete hierarchy
  const { data: teamHierarchy, isLoading: isLoadingHierarchy } = useQuery({
    queryKey: ['team-hierarchy', rootTeamId, maxHierarchyDepth],
    queryFn: () => {
      if (!teams || !teamRelationships) return null;
      
      if (rootTeamId) {
        // If a root team is specified, build hierarchy from there
        const rootTeam = teams.find(t => t.id === rootTeamId);
        if (!rootTeam) return null;
        
        return {
          team: rootTeam,
          childTeams: buildTeamHierarchy(teams, teamRelationships, rootTeamId),
          members: [],
          level: 0
        } as TeamHierarchyNode;
      } else {
        // Otherwise, build the top-level hierarchy
        return {
          team: { id: 'root', name: 'All Teams', created_at: '', updated_at: '' },
          childTeams: buildTeamHierarchy(teams, teamRelationships),
          members: [],
          level: -1
        } as TeamHierarchyNode;
      }
    },
    enabled: !!teams && !!teamRelationships
  });

  // Calculate aggregated metrics for the hierarchy
  const calculateAggregatedMetrics = (node: TeamHierarchyNode): MetricCount => {
    // Here we would fetch metrics for each team and aggregate them
    // For now we'll use mock data
    const baseMetrics: MetricCount = {
      leads: Math.floor(Math.random() * 50) + 10,
      calls: Math.floor(Math.random() * 100) + 30,
      contacts: Math.floor(Math.random() * 70) + 20,
      scheduled: Math.floor(Math.random() * 30) + 5,
      sits: Math.floor(Math.random() * 20) + 3,
      sales: Math.floor(Math.random() * 10) + 1,
      ap: Math.floor(Math.random() * 50000) + 10000,
    };
    
    if (node.childTeams.length === 0) {
      return baseMetrics;
    }
    
    // Aggregate metrics from all child teams
    const childMetrics = node.childTeams.map(calculateAggregatedMetrics);
    return childMetrics.reduce((acc, metrics) => {
      return {
        leads: acc.leads + metrics.leads,
        calls: acc.calls + metrics.calls,
        contacts: acc.contacts + metrics.contacts,
        scheduled: acc.scheduled + metrics.scheduled,
        sits: acc.sits + metrics.sits,
        sales: acc.sales + metrics.sales,
        ap: acc.ap + metrics.ap,
      };
    }, baseMetrics);
  };

  // Add metrics to hierarchy
  const hierarchyWithMetrics = teamHierarchy
    ? { 
        ...teamHierarchy, 
        aggregatedMetrics: calculateAggregatedMetrics(teamHierarchy),
        childTeams: teamHierarchy.childTeams.map(child => ({
          ...child,
          aggregatedMetrics: calculateAggregatedMetrics(child)
        }))
      }
    : null;

  return {
    teamHierarchy: hierarchyWithMetrics,
    isLoading: isLoadingRelationships || isLoadingHierarchy,
    maxHierarchyDepth,
    hasGoldAccess,
    hasPlatinumAccess
  };
};

// Mock data for development
const mockTeamRelationships: TeamRelationship[] = [
  {
    id: "rel1",
    parentTeamId: "1",
    childTeamId: "2",
    relationshipType: 'direct',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "rel2",
    parentTeamId: "1",
    childTeamId: "3",
    relationshipType: 'direct',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
