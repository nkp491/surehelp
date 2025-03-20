
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TeamHierarchy, TeamNode, TeamAggregateMetrics } from "@/types/team-hierarchy";
import { useToast } from "@/hooks/use-toast";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { TeamMember } from "@/types/team";

/**
 * Hook for fetching and managing team hierarchies
 */
export const useTeamHierarchy = (rootTeamId?: string) => {
  const [loading, setLoading] = useState(false);
  const [hierarchy, setHierarchy] = useState<TeamHierarchy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { hasRequiredRole } = useRoleCheck();
  
  // Check if user has permission to view team hierarchies
  const canViewHierarchy = hasRequiredRole(['manager_pro_gold', 'manager_pro_platinum', 'system_admin']);

  // Fetch the team hierarchy data
  const fetchHierarchy = useCallback(async (teamId: string) => {
    if (!canViewHierarchy) {
      setError("You don't have permission to view team hierarchies");
      toast({
        title: "Access Denied",
        description: "You need Manager Pro Gold or higher to view team hierarchies.",
        variant: "destructive"
      });
      return null;
    }
    
    if (!teamId) {
      setError("No team ID provided");
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching hierarchy for team ${teamId}`);
      
      // Step 1: Fetch the root team
      const { data: rootTeamData, error: rootTeamError } = await supabase
        .from('teams')
        .select('id, name, created_at, updated_at')
        .eq('id', teamId)
        .single();
      
      if (rootTeamError) {
        throw rootTeamError;
      }
      
      // Step 2: Recursively build the hierarchy
      const builtHierarchy = await buildTeamHierarchy(teamId, 0);
      
      if (!builtHierarchy) {
        throw new Error("Failed to build team hierarchy");
      }
      
      const result: TeamHierarchy = {
        rootTeam: builtHierarchy,
        allTeams: flattenHierarchy(builtHierarchy),
        allMembers: await getAllTeamMembers(builtHierarchy)
      };
      
      setHierarchy(result);
      return result;
    } catch (err: any) {
      console.error("Error fetching team hierarchy:", err);
      const errorMessage = err.message || "Failed to fetch team hierarchy";
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [canViewHierarchy, toast]);
  
  // Build the team hierarchy recursively
  const buildTeamHierarchy = async (teamId: string, level: number): Promise<TeamNode | null> => {
    // Fetch team details
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name, created_at, updated_at')
      .eq('id', teamId)
      .single();
    
    if (teamError || !team) {
      console.error("Error fetching team details:", teamError);
      return null;
    }
    
    // Fetch team members
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select(`
        id, team_id, user_id, role,
        profiles:user_id (
          id, first_name, last_name, email, profile_image_url
        )
      `)
      .eq('team_id', teamId);
    
    if (membersError) {
      console.error("Error fetching team members:", membersError);
      return null;
    }
    
    // Process members and find manager
    const processedMembers: TeamMember[] = members.map((member: any) => ({
      id: member.id,
      team_id: member.team_id,
      user_id: member.user_id,
      role: member.role,
      created_at: member.created_at,
      updated_at: member.updated_at,
      first_name: member.profiles?.first_name,
      last_name: member.profiles?.last_name,
      email: member.profiles?.email,
      profile_image_url: member.profiles?.profile_image_url
    }));
    
    const manager = processedMembers.find(member => 
      member.role?.startsWith('manager_pro')
    );
    
    // Fetch subteams (teams that have this team as parent)
    // For now, in Phase 2 we'll mock this with sample data
    // In later phases, we'll implement proper parent-child team relationships
    const mockChildren: TeamNode[] = level < 2 ? await getMockChildTeams(teamId, level + 1) : [];
    
    // Calculate metrics
    const metrics = await calculateTeamMetrics(teamId, processedMembers, mockChildren);
    
    // Construct the team node
    const teamNode: TeamNode = {
      ...team,
      level,
      members: processedMembers,
      manager: manager,
      children: mockChildren,
      metrics,
      isExpanded: level === 0 // Root team is expanded by default
    };
    
    return teamNode;
  };
  
  // Helper: Mock child teams for demonstration
  const getMockChildTeams = async (parentId: string, level: number): Promise<TeamNode[]> => {
    // In Phase 2, we'll use mock data to demonstrate the hierarchy
    // In later phases, this will be replaced with real parent-child relationships
    if (level > 2) return []; // Limit depth for demo
    
    const numChildren = Math.floor(Math.random() * 3) + 1; // 1-3 children
    const mockChildren: TeamNode[] = [];
    
    for (let i = 0; i < numChildren; i++) {
      // Get a random existing team to use as a mock child
      const { data: randomTeams, error } = await supabase
        .from('teams')
        .select('id, name, created_at, updated_at')
        .neq('id', parentId)
        .limit(10);
      
      if (error || !randomTeams || randomTeams.length === 0) {
        continue;
      }
      
      // Pick a random team
      const randomIndex = Math.floor(Math.random() * randomTeams.length);
      const randomTeam = randomTeams[randomIndex];
      
      // Create a mock child team
      const childNode = await buildTeamHierarchy(randomTeam.id, level);
      if (childNode) {
        childNode.parentTeamId = parentId;
        mockChildren.push(childNode);
      }
    }
    
    return mockChildren;
  };
  
  // Calculate aggregate metrics for a team including its subteams
  const calculateTeamMetrics = async (
    teamId: string, 
    members: TeamMember[], 
    children: TeamNode[]
  ): Promise<TeamAggregateMetrics> => {
    // Get metrics for the team members
    const memberIds = members.map(m => m.user_id);
    
    // Fetch real metrics when available, otherwise generate mock metrics
    const { data: metricsData, error: metricsError } = await supabase
      .from('daily_metrics')
      .select('*')
      .in('user_id', memberIds)
      .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) // Last 30 days
      .order('date', { ascending: false });
    
    // If no metrics data, create some mock data for demonstration
    const teamMetrics: TeamAggregateMetrics = {
      totalLeads: 0,
      totalCalls: 0,
      totalContacts: 0,
      totalScheduled: 0,
      totalSits: 0,
      totalSales: 0,
      averageAP: 0,
      teamCount: 1 + children.length, // This team + subteams
      memberCount: members.length
    };
    
    // Aggregate metrics from team members
    if (metricsData && metricsData.length > 0) {
      // Use actual data if available
      const userMetrics = new Map();
      
      // Group by user and take the most recent entry for each
      metricsData.forEach(metric => {
        if (!userMetrics.has(metric.user_id) || 
            new Date(metric.date) > new Date(userMetrics.get(metric.user_id).date)) {
          userMetrics.set(metric.user_id, metric);
        }
      });
      
      // Sum up metrics
      userMetrics.forEach(metric => {
        teamMetrics.totalLeads += metric.leads || 0;
        teamMetrics.totalCalls += metric.calls || 0;
        teamMetrics.totalContacts += metric.contacts || 0;
        teamMetrics.totalScheduled += metric.scheduled || 0;
        teamMetrics.totalSits += metric.sits || 0;
        teamMetrics.totalSales += metric.sales || 0;
        
        if (metric.ap) {
          teamMetrics.averageAP += metric.ap;
        }
      });
      
      // Calculate average AP
      if (userMetrics.size > 0 && teamMetrics.averageAP > 0) {
        teamMetrics.averageAP = Math.round(teamMetrics.averageAP / userMetrics.size);
      }
    } else {
      // Use mock data if no real metrics
      const mockTotalLeads = members.length * (Math.floor(Math.random() * 10) + 5);
      const mockContactRate = 0.6 + (Math.random() * 0.3); // 60-90% contact rate
      const mockAppointmentRate = 0.3 + (Math.random() * 0.3); // 30-60% appointment rate
      const mockSitRate = 0.5 + (Math.random() * 0.3); // 50-80% sit rate
      const mockCloseRate = 0.3 + (Math.random() * 0.4); // 30-70% close rate
      
      teamMetrics.totalLeads = mockTotalLeads;
      teamMetrics.totalCalls = Math.floor(mockTotalLeads * 2.5);
      teamMetrics.totalContacts = Math.floor(mockTotalLeads * mockContactRate);
      teamMetrics.totalScheduled = Math.floor(teamMetrics.totalContacts * mockAppointmentRate);
      teamMetrics.totalSits = Math.floor(teamMetrics.totalScheduled * mockSitRate);
      teamMetrics.totalSales = Math.floor(teamMetrics.totalSits * mockCloseRate);
      teamMetrics.averageAP = Math.floor(25000 + (Math.random() * 25000)); // $250-500 AP
    }
    
    // Add metrics from child teams
    children.forEach(child => {
      if (child.metrics) {
        teamMetrics.totalLeads += child.metrics.totalLeads;
        teamMetrics.totalCalls += child.metrics.totalCalls;
        teamMetrics.totalContacts += child.metrics.totalContacts;
        teamMetrics.totalScheduled += child.metrics.totalScheduled;
        teamMetrics.totalSits += child.metrics.totalSits;
        teamMetrics.totalSales += child.metrics.totalSales;
        
        if (child.metrics.averageAP > 0 && child.metrics.memberCount > 0) {
          teamMetrics.averageAP = Math.round(
            (teamMetrics.averageAP * teamMetrics.memberCount + 
             child.metrics.averageAP * child.metrics.memberCount) /
            (teamMetrics.memberCount + child.metrics.memberCount)
          );
        }
        
        teamMetrics.memberCount += child.metrics.memberCount;
      }
    });
    
    return teamMetrics;
  };
  
  // Helper: Flatten hierarchy into an array of all teams
  const flattenHierarchy = (rootTeam: TeamNode): TeamNode[] => {
    const result: TeamNode[] = [rootTeam];
    
    if (rootTeam.children && rootTeam.children.length > 0) {
      rootTeam.children.forEach(child => {
        result.push(...flattenHierarchy(child));
      });
    }
    
    return result;
  };
  
  // Helper: Get all team members from the hierarchy
  const getAllTeamMembers = async (rootTeam: TeamNode): Promise<TeamMember[]> => {
    const allMembers: Map<string, TeamMember> = new Map();
    
    // Add members from the root team
    if (rootTeam.members) {
      rootTeam.members.forEach(member => {
        allMembers.set(member.user_id, member);
      });
    }
    
    // Add members from child teams
    if (rootTeam.children && rootTeam.children.length > 0) {
      for (const childTeam of rootTeam.children) {
        const childMembers = await getAllTeamMembers(childTeam);
        childMembers.forEach(member => {
          if (!allMembers.has(member.user_id)) {
            allMembers.set(member.user_id, member);
          }
        });
      }
    }
    
    return Array.from(allMembers.values());
  };
  
  // Fetch the hierarchy when the root team ID changes
  useEffect(() => {
    if (rootTeamId && canViewHierarchy) {
      fetchHierarchy(rootTeamId);
    }
  }, [rootTeamId, canViewHierarchy, fetchHierarchy]);
  
  return {
    hierarchy,
    loading,
    error,
    fetchHierarchy,
    canViewHierarchy
  };
};
