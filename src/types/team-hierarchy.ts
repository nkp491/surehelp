
import { Team, TeamMember } from "./team";

export type ManagerRole = "manager_pro" | "manager_pro_gold" | "manager_pro_platinum";

export interface TeamNode extends Team {
  children?: TeamNode[];
  manager?: TeamMember;
  members?: TeamMember[];
  parentTeamId?: string | null;
  level: number;
  metrics?: TeamAggregateMetrics;
  isExpanded?: boolean;
}

export interface TeamHierarchy {
  rootTeam: TeamNode;
  allTeams: TeamNode[];
  allMembers: TeamMember[];
}

export interface TeamAggregateMetrics {
  totalLeads: number;
  totalCalls: number;
  totalContacts: number;
  totalScheduled: number;
  totalSits: number;
  totalSales: number;
  averageAP: number;
  teamCount: number;
  memberCount: number;
  // More metrics will be added in future phases
}

export interface ManagerTierPermissions {
  canViewHierarchy: boolean;
  canViewSubteams: boolean;
  canViewAdvancedMetrics: boolean;
  canExportTeamData: boolean;
  canManageSubteams: boolean;
  maxTeamDepth: number;
  maxMembersPerTeam: number;
}

export const DEFAULT_MANAGER_PERMISSIONS: Record<ManagerRole, ManagerTierPermissions> = {
  "manager_pro": {
    canViewHierarchy: false,
    canViewSubteams: false,
    canViewAdvancedMetrics: false,
    canExportTeamData: false,
    canManageSubteams: false,
    maxTeamDepth: 1, // Only direct team
    maxMembersPerTeam: 10
  },
  "manager_pro_gold": {
    canViewHierarchy: true,
    canViewSubteams: true,
    canViewAdvancedMetrics: true,
    canExportTeamData: true,
    canManageSubteams: false,
    maxTeamDepth: 2, // Team and direct subteams
    maxMembersPerTeam: 25
  },
  "manager_pro_platinum": {
    canViewHierarchy: true,
    canViewSubteams: true,
    canViewAdvancedMetrics: true,
    canExportTeamData: true,
    canManageSubteams: true,
    maxTeamDepth: 999, // No practical limit
    maxMembersPerTeam: 999 // No practical limit
  }
};
