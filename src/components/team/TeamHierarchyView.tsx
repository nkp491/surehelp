
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamMetricsOverview } from "./TeamMetricsOverview";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Users } from "lucide-react";
import { TeamNode } from "@/types/team-hierarchy";
import { Badge } from "@/components/ui/badge";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";

interface TeamHierarchyViewProps {
  rootTeamId: string;
  timePeriod: string;
  customDate?: Date;
}

export function TeamHierarchyView({ rootTeamId, timePeriod, customDate }: TeamHierarchyViewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [teamHierarchy, setTeamHierarchy] = useState<TeamNode | null>(null);
  const [expandedTeams, setExpandedTeams] = useState<string[]>([rootTeamId]);
  const { fetchHierarchy, isLoadingHierarchy } = useTeamManagement();

  useEffect(() => {
    const loadHierarchy = async () => {
      setIsLoading(true);
      try {
        const hierarchyData = await fetchHierarchy(rootTeamId);
        if (hierarchyData) {
          setTeamHierarchy(hierarchyData.rootTeam);
          // Auto-expand the root team
          setExpandedTeams([rootTeamId]);
        }
      } catch (error) {
        console.error("Error loading team hierarchy:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (rootTeamId) {
      loadHierarchy();
    }
  }, [rootTeamId, fetchHierarchy]);

  const toggleTeamExpansion = (teamId: string) => {
    setExpandedTeams(prev => 
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const renderTeamNode = (team: TeamNode, level: number = 0) => {
    const isExpanded = expandedTeams.includes(team.id);
    const hasChildren = team.children && team.children.length > 0;
    
    return (
      <div key={team.id} className="mb-3">
        <Card className={`border-l-4 ${level === 0 ? 'border-l-primary' : 'border-l-muted-foreground/40'}`}>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {hasChildren && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleTeamExpansion(team.id)}
                    className="mr-2 h-8 w-8"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold">{team.name}</h3>
                    {team.manager && (
                      <Badge variant="outline" className="ml-2">
                        Manager: {team.manager.first_name} {team.manager.last_name}
                      </Badge>
                    )}
                  </div>
                  <div className="flex text-xs text-muted-foreground mt-1 space-x-3">
                    <span className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {team.metrics?.memberCount || 0} members
                    </span>
                    {team.metrics && (
                      <>
                        <span>Leads: {team.metrics.totalLeads || 0}</span>
                        <span>Sales: {team.metrics.totalSales || 0}</span>
                        <span>Avg AP: ${((team.metrics.averageAP || 0) / 100).toFixed(2)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Button variant="outline" size="sm">Details</Button>
              </div>
            </div>
          </div>
          
          {/* Team Metrics Panel (expanded when clicked) */}
          <Collapsible open={isExpanded}>
            <CollapsibleContent>
              <div className="px-4 pb-4">
                <TeamMetricsOverview teamId={team.id} />
                
                {/* Render children teams if they exist and the parent is expanded */}
                {hasChildren && isExpanded && (
                  <div className="pl-4 mt-4 border-l border-dashed border-border">
                    {team.children!.map(childTeam => renderTeamNode(childTeam, level + 1))}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Hierarchy</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading || isLoadingHierarchy ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
        ) : !teamHierarchy ? (
          <div className="text-center p-6">
            <p className="text-muted-foreground">No team hierarchy data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {renderTeamNode(teamHierarchy)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
