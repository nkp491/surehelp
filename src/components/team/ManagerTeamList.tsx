import { useState, useEffect } from "react";
import { useManagerTeam } from "@/hooks/useManagerTeam";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ManagerTeamListProps {
  managerId?: string;
  selectedTeamId?: string;
}

export function ManagerTeamList({ managerId, selectedTeamId }: ManagerTeamListProps) {
  const { teamMembers, isLoading } = useManagerTeam(managerId);
  const [filteredMembers, setFilteredMembers] = useState(teamMembers);

  useEffect(() => {
    if (teamMembers && selectedTeamId) {
      // If a team is selected, filter to only show members of that team
      const filtered = teamMembers.filter(member => member.team_id === selectedTeamId);
      setFilteredMembers(filtered);
      console.log(`Filtered team members for team ${selectedTeamId}:`, filtered.length);
    } else {
      // Otherwise show all team members
      setFilteredMembers(teamMembers);
    }
  }, [teamMembers, selectedTeamId]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-muted-foreground">Loading team members...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!filteredMembers || filteredMembers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-muted-foreground">
              {selectedTeamId 
                ? "No members found in this team." 
                : "You don't have any team members yet."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center p-3 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Avatar className="h-10 w-10 mr-4">
                <AvatarImage src={member.profile_image_url || ""} alt={member.first_name || ""} />
                <AvatarFallback>
                  {member.first_name?.[0]}
                  {member.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">
                  {member.first_name} {member.last_name}
                </h3>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
