import { useTeamMembers } from "./team/useTeamMembers";
import { useTeamInvitations } from "./team/useTeamInvitations";

export const useTeamDashboard = () => {
  const { teamMembers, isLoading, handleRemoveMember } = useTeamMembers();
  const { invitations, handleInviteMember, handleCancelInvitation } = useTeamInvitations();

  return {
    teamMembers,
    invitations,
    isLoading,
    handleInviteMember,
    handleRemoveMember,
    handleCancelInvitation,
  };
};