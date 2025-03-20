
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  ChevronRight, 
  ChevronDown, 
  Users, 
  UserCog, 
  BarChart3 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TeamHierarchyNode } from "@/types/teamHierarchy";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/utils/formatters";

interface TeamHierarchyViewProps {
  hierarchy?: TeamHierarchyNode | null;
  isLoading: boolean;
  onSelectTeam: (teamId: string) => void;
  selectedTeamId?: string;
}

export function TeamHierarchyView({ 
  hierarchy, 
  isLoading, 
  onSelectTeam,
  selectedTeamId 
}: TeamHierarchyViewProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(["root"]));

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Hierarchy</CardTitle>
          <CardDescription>View your team structure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-5 w-40" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hierarchy) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Hierarchy</CardTitle>
          <CardDescription>No teams available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No team hierarchy data available. Please create or join a team.
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderTeamNode = (node: TeamHierarchyNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.team.id);
    const isSelected = selectedTeamId === node.team.id;
    const hasChildren = node.childTeams.length > 0;
    
    return (
      <div key={node.team.id}>
        <div 
          className={`flex items-center py-2 hover:bg-muted/50 rounded-md ${
            isSelected ? 'bg-muted' : ''
          }`}
          style={{ paddingLeft: `${depth * 16}px` }}
        >
          {hasChildren ? (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 mr-1" 
              onClick={() => toggleNode(node.team.id)}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-7"></div> {/* Spacer */}
          )}
          
          <Button 
            variant="ghost" 
            className={`justify-start text-left font-medium flex-1 ${
              isSelected ? 'font-semibold' : ''
            }`} 
            onClick={() => onSelectTeam(node.team.id)}
          >
            <Users className="h-4 w-4 mr-2" />
            {node.team.name}
          </Button>
          
          {node.aggregatedMetrics && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mr-2">
              <Badge variant="outline" className="flex items-center">
                <BarChart3 className="h-3 w-3 mr-1" />
                {formatNumber(node.aggregatedMetrics.sales)} sales
              </Badge>
            </div>
          )}
        </div>
        
        {isExpanded && hasChildren && (
          <div className="ml-2">
            {node.childTeams.map(childNode => renderTeamNode(childNode, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <UserCog className="h-5 w-5 mr-2" />
          Team Hierarchy
        </CardTitle>
        <CardDescription>
          {hierarchy.childTeams.length > 0 
            ? `${hierarchy.childTeams.length} team${hierarchy.childTeams.length > 1 ? 's' : ''} in organization`
            : 'No sub-teams available'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {renderTeamNode(hierarchy)}
        </div>
      </CardContent>
    </Card>
  );
}
