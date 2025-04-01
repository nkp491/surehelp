
import { useState, useEffect } from "react";
import { useManagerTeam } from "@/hooks/useManagerTeam";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamMember } from "@/types/team";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ManagerTeamListProps {
  managerId?: string;
  selectedTeamId?: string;
}

export function ManagerTeamList({ managerId, selectedTeamId }: ManagerTeamListProps) {
  const { 
    teamMembers, 
    isLoading: isLoadingDirectReports,
    getTeamMembersByTeamQuery,
    refetch
  } = useManagerTeam(managerId);
  
  const { 
    data: teamMembersByTeam, 
    isLoading: isLoadingTeamMembers,
    error: teamMembersError,
    refetch: refetchTeamMembers
  } = getTeamMembersByTeamQuery(selectedTeamId);
  
  const [displayMembers, setDisplayMembers] = useState<TeamMember[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isLoading = isLoadingDirectReports || isLoadingTeamMembers || isRefreshing;
  const { toast } = useToast();

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log("Refreshing team members data...");
      if (selectedTeamId) {
        await refetchTeamMembers();
      }
      await refetch();
      toast({
        title: "Refreshed",
        description: "Team members data has been refreshed.",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh team members data.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Team Members</CardTitle>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Refreshing...
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center p-3 rounded-md border border-gray-200">
                <Skeleton className="h-10 w-10 rounded-full mr-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // If there's an error fetching team members
  if (teamMembersError && selectedTeamId) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Team Members</CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-muted-foreground mb-2">
              There was an issue loading team members. This may be due to a database configuration issue.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              className="mx-auto"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!displayMembers || displayMembers.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {selectedTeamId ? "Team Members" : "Your Direct Reports"}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-muted-foreground">
              {selectedTeamId 
                ? "No members found in this team. Try refreshing or adding members to the team." 
                : "You don't have any team members yet."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {selectedTeamId ? "Team Members" : "Your Direct Reports"}
        </CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
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
