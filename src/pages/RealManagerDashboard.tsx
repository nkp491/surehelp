
import { useState, useEffect } from "react";
import { useProfileManagement } from "@/hooks/useProfileManagement";
import { useManagerTeam } from "@/hooks/useManagerTeam";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { TeamsPanel } from "@/components/team/dashboard/TeamsPanel";
import { TeamDashboardTabs } from "@/components/team/dashboard/TeamDashboardTabs";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function RealManagerDashboard() {
  const { profile } = useProfileManagement();
  const { getTeamsDirectQuery, refetchTeams } = useTeamManagement();
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>();
  const { teamMembers, isLoading: isLoadingTeam } = useManagerTeam(profile?.id);
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  
  // Use the direct teams query method to bypass RLS issues
  const { data: teams, isLoading: isLoadingTeams, refetch: refetchDirectTeams } = getTeamsDirectQuery(profile?.id);

  // Fetch teams when dashboard loads
  useEffect(() => {
    console.log("Dashboard mounted, fetching teams...");
    fetchTeams();
  }, []);

  // Handle fetch with error handling
  const fetchTeams = async () => {
    try {
      setError(null);
      await refetchDirectTeams();
      // Also try the regular refetch for completeness
      await refetchTeams();
    } catch (err: any) {
      console.error("Error fetching teams:", err);
      setError(err?.message || "Failed to load teams. Please try again.");
    }
  };

  // Initialize with the first team when teams are loaded
  useEffect(() => {
    if (teams && teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
      console.log("Selected first team:", teams[0].id, teams[0].name);
    } else if (teams) {
      console.log("Teams loaded:", teams.length, "Current selected team:", selectedTeamId);
    }
  }, [teams, selectedTeamId]);

  // Handle team selection
  const handleTeamChange = (teamId: string) => {
    console.log("Team selected:", teamId);
    setSelectedTeamId(teamId);
  };

  // Handle refresh
  const handleRefresh = async () => {
    console.log("Refreshing teams...");
    await fetchTeams();
    
    toast({
      title: "Teams Refreshed",
      description: "Your teams list has been refreshed.",
    });
  };

  // Special fix for Momentum Capitol association
  useEffect(() => {
    const checkMomentumAssociation = async () => {
      try {
        // Check if user is nielsenaragon@gmail.com
        if (profile?.email === 'nielsenaragon@gmail.com') {
          console.log("Detected nielsenaragon@gmail.com, checking Momentum Capitol association");
          
          // Get all teams
          const { data: allTeams } = await supabase
            .from('teams')
            .select('*');
          
          // Find Momentum teams
          const momentumTeams = allTeams?.filter(team => 
            team.name.includes('Momentum Capitol') || 
            team.name.includes('Momentum Capital')
          ) || [];
          
          if (momentumTeams.length > 0) {
            console.log("Found Momentum teams:", momentumTeams);
            
            // For each Momentum team
            for (const team of momentumTeams) {
              // Check if user is already a member
              const { data: existingMembership } = await supabase
                .from('team_members')
                .select('id')
                .eq('team_id', team.id)
                .eq('user_id', profile.id);
              
              if (!existingMembership || existingMembership.length === 0) {
                console.log(`Adding user to ${team.name}`);
                
                // Add user to team
                const { error: addError } = await supabase
                  .from('team_members')
                  .insert([{ 
                    team_id: team.id,
                    user_id: profile.id,
                    role: 'manager_pro_platinum'
                  }]);
                  
                if (addError) {
                  console.error(`Error adding user to ${team.name}:`, addError);
                } else {
                  console.log(`Successfully added user to ${team.name}`);
                  await fetchTeams(); // Refresh teams after adding
                }
              } else {
                console.log(`User already member of ${team.name}`);
              }
            }
          } else {
            console.log("Momentum Capitol team not found in teams list. Will try to repair the association.");
            await fetchTeams();
          }
        }
      } catch (err) {
        console.error("Error in checkMomentumAssociation:", err);
      }
    };
    
    if (profile?.email) {
      checkMomentumAssociation();
    }
  }, [profile?.email]);

  return (
    <div className="container mx-auto p-6">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2" 
              onClick={fetchTeams}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="col-span-12 md:col-span-3 space-y-6">
          <TeamsPanel
            teams={teams}
            isLoadingTeams={isLoadingTeams}
            selectedTeamId={selectedTeamId}
            onTeamSelect={handleTeamChange}
            onRefresh={handleRefresh}
          />
        </div>

        {/* Middle and Right Columns Combined */}
        <div className="col-span-12 md:col-span-9">
          <TeamDashboardTabs 
            managerId={profile?.id} 
            selectedTeamId={selectedTeamId}
          />
        </div>
      </div>
    </div>
  );
}
