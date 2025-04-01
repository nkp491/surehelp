
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ManagerDisplay from "./team/ManagerDisplay";
import ManagerEmailInput from "./team/ManagerEmailInput";
import { useManagerValidation } from "./team/useManagerValidation";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { TeamCreationDialog } from "@/components/team/TeamCreationDialog";
import { Plus, Users, RefreshCw } from "lucide-react";
import { Team } from "@/types/team";

interface TeamInformationProps {
  managerId?: string | null;
  onUpdate: (data: any) => void;
}

const TeamInformation = ({
  managerId,
  onUpdate
}: TeamInformationProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [managerEmail, setManagerEmail] = useState('');
  const [managerName, setManagerName] = useState('');
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  
  const { language } = useLanguage();
  const { toast } = useToast();
  const t = translations[language];
  const { validateManagerEmail, isLoading } = useManagerValidation();
  const { userRoles } = useRoleCheck();
  
  // Check if user has manager role
  const isManager = userRoles.some(role => role.startsWith('manager_pro'));

  // Fetch current manager details if managerId exists
  useEffect(() => {
    const fetchManagerDetails = async () => {
      if (!managerId) {
        setManagerName('');
        setManagerEmail('');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', managerId)
          .single();

        if (error) throw error;
        
        if (data) {
          setManagerName(`${data.first_name || ''} ${data.last_name || ''}`.trim());
          setManagerEmail(data.email || '');
        }
      } catch (error) {
        console.error("Error fetching manager details:", error);
      }
    };

    fetchManagerDetails();
  }, [managerId]);

  // Fetch user's teams
  const fetchUserTeams = async () => {
    setIsLoadingTeams(true);
    try {
      // Get the user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoadingTeams(false);
        return;
      }

      console.log("Fetching teams for user:", user.id);
      
      // First get all team_members entries for the user
      const { data: teamMembers, error: teamMembersError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);

      if (teamMembersError) {
        console.error("Error fetching team members:", teamMembersError);
        toast({
          title: "Error",
          description: "Failed to fetch your team memberships.",
          variant: "destructive",
        });
        setIsLoadingTeams(false);
        return;
      }
      
      if (!teamMembers || teamMembers.length === 0) {
        console.log("No team memberships found for user");
        setUserTeams([]);
        setIsLoadingTeams(false);
        return;
      }
      
      console.log("Found team memberships:", teamMembers);
      
      // Extract team IDs
      const teamIds = teamMembers.map(tm => tm.team_id);
      
      // Get team details
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .in('id', teamIds);
        
      if (teamsError) {
        console.error("Error fetching teams:", teamsError);
        toast({
          title: "Error",
          description: "Failed to fetch your teams.",
          variant: "destructive",
        });
        setIsLoadingTeams(false);
        return;
      }
      
      setUserTeams(teams || []);
      console.log("User teams:", teams);
    } catch (error) {
      console.error("Error fetching user teams:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your teams.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTeams(false);
    }
  };

  // Load teams on component mount and when isManager changes
  useEffect(() => {
    if (isManager) {
      fetchUserTeams();
    }
  }, [isManager]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationResult = await validateManagerEmail(managerEmail);
    
    if (validationResult.valid) {
      await onUpdate({ manager_id: validationResult.managerId });
      setIsEditing(false);
      
      if (validationResult.managerId === null) {
        toast({
          title: "Manager Removed",
          description: "You have removed your manager assignment.",
        });
      } else {
        toast({
          title: "Manager Updated",
          description: "Your manager has been updated successfully.",
        });
      }
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      // If we're currently editing and toggling off, submit the form
      handleSubmit(new Event('submit') as unknown as React.FormEvent);
    } else {
      setIsEditing(true);
    }
  };

  const handleRefreshTeams = () => {
    fetchUserTeams();
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-semibold text-foreground">Team Information</CardTitle>
        <div className="flex gap-2">
          {isManager && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCreateTeamDialog(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Create Team</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleEdit}
            className="px-4"
          >
            {isEditing ? t.save : t.edit}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2.5">
            <label className="text-sm font-medium text-gray-700">Your Manager</label>
            {isEditing ? (
              <ManagerEmailInput 
                managerEmail={managerEmail}
                onChange={setManagerEmail}
              />
            ) : (
              <ManagerDisplay 
                managerName={managerName}
                managerEmail={managerEmail}
              />
            )}
          </div>

          {isManager && (
            <div className="space-y-2.5 mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Your Teams</label>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleRefreshTeams}
                  className="h-8 w-8"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              {isLoadingTeams ? (
                <div className="text-sm text-gray-500">Loading teams...</div>
              ) : userTeams.length > 0 ? (
                <div className="space-y-2">
                  {userTeams.map(team => (
                    <div key={team.id} className="flex items-center p-2 border rounded-md">
                      <Users className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{team.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  You don't have any teams yet. Create a team to get started.
                </div>
              )}
            </div>
          )}
          
          {isEditing && (
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : t.save}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
      
      {/* Team Creation Dialog */}
      <TeamCreationDialog
        open={showCreateTeamDialog}
        onOpenChange={setShowCreateTeamDialog}
        onSuccess={handleRefreshTeams}
      />
    </Card>
  );
};

export default TeamInformation;
