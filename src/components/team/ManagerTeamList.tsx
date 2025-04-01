
import { useState, useEffect } from "react";
import { useManagerTeam } from "@/hooks/useManagerTeam";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamMember } from "@/types/team";

interface ManagerTeamListProps {
  managerId?: string;
  selectedTeamId?: string;
}

export function ManagerTeamList({ managerId, selectedTeamId }: ManagerTeamListProps) {
  const { 
    teamMembers, 
    isLoading: isLoadingDirectReports,
    getTeamMembersByTeamQuery 
  } = useManagerTeam(managerId);
  
  const { 
    data: teamMembersByTeam, 
    isLoading: isLoadingTeamMembers 
  } = getTeamMembersByTeamQuery(selectedTeamId);
  
  const [displayMembers, setDisplayMembers] = useState<TeamMember[]>([]);
  const isLoading = isLoadingDirectReports || isLoadingTeamMembers;

  useEffect(() => {
    // Determine which members to display based on whether a team is selected
    if (selectedTeamId && teamMembersByTeam) {
      console.log("Displaying team members for team:", selectedTeamId, teamMembersByTeam);
      setDisplayMembers(teamMembersByTeam);
    } else if (teamMembers) {
      console.log("Displaying direct reports for manager:", managerId, teamMembers);
      setDisplayMembers(teamMembers);
    } else {
      setDisplayMembers([]);
    }
  }, [teamMembers, teamMembersByTeam, selectedTeamId, managerId]);

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

  if (!displayMembers || displayMembers.length === 0) {
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
        <CardTitle>
          {selectedTeamId ? "Team Members" : "Your Direct Reports"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayMembers.map((member) => (
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
                {member.role && (
                  <p className="text-xs text-gray-400 mt-1">
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1).replace(/_/g, ' ')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
