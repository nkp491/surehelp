import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TeamInvitation } from "@/types/team";

interface InvitationsListProps {
  invitations: TeamInvitation[];
  onCancelInvitation: (invitationId: string) => Promise<void>;
}

const InvitationsList = ({ invitations, onCancelInvitation }: InvitationsListProps) => {
  if (invitations.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No pending invitations</AlertTitle>
        <AlertDescription>
          You haven't sent any team invitations yet.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <p className="text-sm text-gray-500">Invitation sent to:</p>
              <p className="font-semibold">{invitation.invitee_email}</p>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                {invitation.status}
              </span>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onCancelInvitation(invitation.id)}
            >
              Cancel Invitation
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default InvitationsList;