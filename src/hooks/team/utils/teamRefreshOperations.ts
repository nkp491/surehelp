
import { UseQueryResult } from "@tanstack/react-query";
import { Team } from "@/types/team";

/**
 * Refreshes team data
 */
export const refreshTeams = async (
  refetchTeams: () => Promise<UseQueryResult<Team[], unknown>>
): Promise<void> => {
  try {
    await refetchTeams();
    console.log("Teams refreshed successfully");
  } catch (error) {
    console.error("Error refreshing teams:", error);
  }
};

/**
 * Refreshes team members data
 */
export const refreshTeamMembers = async (
  refetchTeamMembers: () => Promise<any>,
  teamId?: string
): Promise<void> => {
  try {
    await refetchTeamMembers();
    console.log(`Team members refreshed ${teamId ? 'for team ' + teamId : 'successfully'}`);
  } catch (error) {
    console.error(`Error refreshing team members ${teamId ? 'for team ' + teamId : ''}:`, error);
  }
};
