import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TeamMember } from "@/types/team";

interface TeamMembersListProps {
  members: TeamMember[];
  isLoading: boolean;
  onRemoveMember: (memberId: string) => Promise<void>;
}

const TeamMembersList = ({ members, isLoading, onRemoveMember }: TeamMembersListProps) => {
  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (members.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No team members found</AlertTitle>
        <AlertDescription>
          Start building your team by inviting members.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div>
              <h3 className="font-semibold">
                {member.profile?.first_name} {member.profile?.last_name}
              </h3>
              <p className="text-sm text-gray-500">{member.profile?.email}</p>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {member.role}
              </span>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Leads</p>
                <p className="font-semibold">{member.metrics?.leads || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Sales</p>
                <p className="font-semibold">{member.metrics?.sales || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">AP</p>
                <p className="font-semibold">
                  ${member.metrics?.ap ? (member.metrics.ap / 100).toFixed(2) : '0.00'}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRemoveMember(member.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TeamMembersList;