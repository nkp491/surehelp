
import { Team, TeamMember } from "@/types/team";
import { MetricCount } from "@/types/metrics";

export interface TeamHierarchyNode {
  team: Team;
  parentTeamId?: string;
  childTeams: TeamHierarchyNode[];
  members: TeamMember[];
  aggregatedMetrics?: MetricCount;
  level: number;
}

export interface TeamRelationship {
  id: string;
  parentTeamId: string;
  childTeamId: string;
  relationshipType: 'direct' | 'functional';
  created_at: string;
  updated_at: string;
}

export interface HierarchicalTeamMetrics {
  directTeamMetrics: MetricCount;
  allTeamsMetrics: MetricCount; // Includes all child teams
  directAgentsCount: number;
  allAgentsCount: number; // Includes agents from child teams
}
