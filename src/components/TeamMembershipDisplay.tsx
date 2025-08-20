import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTeamMembership } from "@/hooks/useTeamMembership";
import {
  checkCurrentUserTeamMembership,
  TeamMembershipInfo,
} from "@/utils/teamUtils";

export function TeamMembershipDisplay() {
  const { teamMembership, isLoading, isTeamMember } = useTeamMembership();
  const [manualCheck, setManualCheck] = useState<TeamMembershipInfo | null>(
    null
  );

  // Example of manual check
  useEffect(() => {
    const checkMembership = async () => {
      const result = await checkCurrentUserTeamMembership();
      setManualCheck(result);
    };
    checkMembership();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Membership</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading team membership information...</p>
        </CardContent>
      </Card>
    );
  }

  if (!isTeamMember) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Membership</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You are not currently a member of any team.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Membership</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">Team</h4>
            <p className="text-lg font-semibold">{teamMembership?.team_name}</p>
          </div>
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">
              Your Role
            </h4>
            <Badge variant="outline">{teamMembership?.role}</Badge>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-sm text-muted-foreground">
            Team Manager
          </h4>
          <p className="text-lg">{teamMembership?.manager_name}</p>
          <p className="text-sm text-muted-foreground">
            {teamMembership?.manager_email}
          </p>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium text-sm text-muted-foreground mb-2">
            Debug Information
          </h4>
          <div className="text-xs bg-muted p-2 rounded">
            <p>
              <strong>Team ID:</strong> {teamMembership?.team_id}
            </p>
            <p>
              <strong>Manager ID:</strong> {teamMembership?.manager_id}
            </p>
            <p>
              <strong>Manual Check Result:</strong>{" "}
              {manualCheck ? "Success" : "Failed"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
