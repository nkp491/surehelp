
import { useEffect } from "react";
import { useTeamInvitations } from "@/hooks/team/useTeamInvitations";
import { TeamInvitation } from "@/types/team";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

export function UserInvitationsNotification() {
  const {
    userInvitations,
    isLoadingUserInvitations,
    refreshUserInvitations,
    updateInvitationStatus,
  } = useTeamInvitations();
  const navigate = useNavigate();

  // Get only pending invitations
  const pendingInvitations = userInvitations?.filter(
    (invitation) => invitation.status === "pending"
  ) || [];

  // Refresh invitations when component mounts
  useEffect(() => {
    refreshUserInvitations();
  }, [refreshUserInvitations]);

  const handleAcceptInvitation = async (invitationId: string) => {
    await updateInvitationStatus.mutateAsync({
      invitationId,
      status: "accepted",
    });
    navigate("/team");
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    await updateInvitationStatus.mutateAsync({
      invitationId,
      status: "declined",
    });
  };

  // If no pending invitations, don't render anything
  if (pendingInvitations.length === 0 && !isLoadingUserInvitations) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {pendingInvitations.length > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-2 border-b">
          <h3 className="font-medium">Team Invitations</h3>
        </div>
        {isLoadingUserInvitations ? (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Loading invitations...</p>
          </div>
        ) : pendingInvitations.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">No pending invitations</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-auto">
            {pendingInvitations.map((invitation: TeamInvitation) => (
              <div
                key={invitation.id}
                className="p-3 border-b last:border-b-0 hover:bg-muted/50"
              >
                <div className="mb-2">
                  <p className="font-medium">{invitation.team_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {invitation.inviter_name} invited you to join as {invitation.role.replace("_", " ")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex space-x-2 mt-2">
                  <Button
                    size="sm"
                    onClick={() => handleAcceptInvitation(invitation.id)}
                    className="flex-1"
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeclineInvitation(invitation.id)}
                    className="flex-1"
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
