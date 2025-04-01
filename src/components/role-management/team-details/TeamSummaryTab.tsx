
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TeamMember } from "@/types/team";

interface RelatedTeam {
  id: string;
  name: string;
  relationship: string;
}

interface TeamSummaryTabProps {
  teamName: string;
  createdAt: string;
  teamMembers: TeamMember[];
  relatedTeams: RelatedTeam[];
  formatDate: (dateString: string) => string;
}

export function TeamSummaryTab({ 
  teamName, 
  createdAt, 
  teamMembers, 
  relatedTeams,
  formatDate 
}: TeamSummaryTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Team Name</h4>
            <p className="text-lg font-semibold">{teamName}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Created At</h4>
            <p className="text-lg font-semibold">{formatDate(createdAt)}</p>
          </div>
        </div>
        <Separator />
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Membership Summary</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted rounded-md p-3 text-center">
              <p className="text-2xl font-bold">{teamMembers.length}</p>
              <p className="text-sm text-muted-foreground">Total Members</p>
            </div>
            <div className="bg-muted rounded-md p-3 text-center">
              <p className="text-2xl font-bold">
                {teamMembers.filter(m => m.role.includes('manager')).length}
              </p>
              <p className="text-sm text-muted-foreground">Managers</p>
            </div>
            <div className="bg-muted rounded-md p-3 text-center">
              <p className="text-2xl font-bold">
                {teamMembers.filter(m => m.role.includes('agent')).length}
              </p>
              <p className="text-sm text-muted-foreground">Agents</p>
            </div>
          </div>
        </div>
        {relatedTeams.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Team Relationships</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted rounded-md p-3 text-center">
                  <p className="text-2xl font-bold">
                    {relatedTeams.filter(t => t.relationship === 'Parent').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Parent Teams</p>
                </div>
                <div className="bg-muted rounded-md p-3 text-center">
                  <p className="text-2xl font-bold">
                    {relatedTeams.filter(t => t.relationship === 'Child').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Child Teams</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
