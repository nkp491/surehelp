
import { useState } from "react";
import { useTeamInvitations } from "@/hooks/team/useTeamInvitations";
import { TeamInvitation } from "@/types/team";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, UserPlus, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamInvitationsListProps {
  teamId?: string;
}

export function TeamInvitationsList({ teamId }: TeamInvitationsListProps) {
  const {
    teamInvitations,
    isLoadingTeamInvitations,
    refreshTeamInvitations,
    createInvitation,
    deleteInvitation,
    isLoading
  } = useTeamInvitations(teamId);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("agent");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !inviteEmail || !inviteRole) return;

    await createInvitation.mutateAsync({
      teamId,
      email: inviteEmail,
      role: inviteRole
    });

    setInviteEmail("");
  };

  const handleCancelInvite = async (invitationId: string) => {
    if (confirm("Are you sure you want to cancel this invitation?")) {
      await deleteInvitation.mutateAsync(invitationId);
    }
  };

  // Filter invitations by search query
  const filteredInvitations = teamInvitations?.filter(invitation => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const emailMatch = invitation.email?.toLowerCase().includes(query);
    const nameMatch = invitation.invitee_name?.toLowerCase().includes(query);
    
    return emailMatch || nameMatch;
  }) || [];

  // Get badge variant based on status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "pending": return "secondary";
      case "accepted": return "default";  // Changed from success to default
      case "declined": return "destructive";
      case "expired": return "outline";
      default: return "default";
    }
  };

  // Format status text for display
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team Invitations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              type="email"
              className="flex-1"
              disabled={isLoading || !teamId}
            />
            <Select 
              value={inviteRole} 
              onValueChange={setInviteRole}
              disabled={isLoading || !teamId}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="agent_pro">Agent Pro</SelectItem>
                <SelectItem value="manager_pro">Manager Pro</SelectItem>
                <SelectItem value="manager_pro_gold">Manager Pro Gold</SelectItem>
                <SelectItem value="manager_pro_platinum">Manager Pro Platinum</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              type="submit" 
              disabled={isLoading || !inviteEmail || !teamId}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="h-4 w-4 mr-2" />
              )}
              Invite
            </Button>
          </form>

          <Input
            placeholder="Search invitations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />

          {isLoadingTeamInvitations ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              <p className="text-sm text-muted-foreground mt-2">Loading invitations...</p>
            </div>
          ) : filteredInvitations.length === 0 ? (
            <div className="text-center py-6 border rounded-md">
              <Mail className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">
                {searchQuery.trim() 
                  ? "No invitations match your search" 
                  : "No invitations sent yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInvitations.map((invitation: TeamInvitation) => (
                <div key={invitation.id} className="border rounded-md p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex gap-3 items-center">
                    <ProfileAvatar
                      imageUrl={null}
                      firstName={invitation.email?.charAt(0) || "?"}
                      className="h-10 w-10"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{invitation.invitee_name || invitation.email}</p>
                        <Badge variant={getBadgeVariant(invitation.status)}>
                          {formatStatus(invitation.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <span>Role: {invitation.role.replace('_', ' ')}</span>
                        <span className="mx-1">•</span>
                        <span>Sent {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex ml-auto">
                    {invitation.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelInvite(invitation.id)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
