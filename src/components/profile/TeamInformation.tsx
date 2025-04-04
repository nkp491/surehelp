
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ManagerSection } from "./team/ManagerSection";
import { TeamsSection } from "./team/TeamsSection";
import { useProfileData } from "@/hooks/profile/useProfileData";
import { useToast } from "@/hooks/use-toast";
import { Team } from "@/types/team";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Component that displays team information in the user profile
 */
export const TeamInformation = () => {
  const { profile, isLoading } = useProfileData();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);

  // Only used for manager email input temporarily during update
  const [managerEmail, setManagerEmail] = useState<string>('');

  // Get teams and setup team state
  const [teams, setTeams] = useState<Team[]>([]);

  // Force refresh team associations (used after updating manager)
  const refreshTeamAssociations = async () => {
    setIsUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Force team association with manager's teams
      const { data, error } = await supabase.rpc(
        'force_agent_team_association' as any,
        { agent_id: user.id }
      );
      
      if (error) {
        console.error("Error in force_agent_team_association:", error);
        toast({ 
          title: "Error updating team information",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      // If successful, invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      
      if (data) {
        toast({
          title: "Team Information Updated",
          description: "Your team information has been updated successfully.",
        });
      }
    } catch (error: any) {
      console.error("Error updating team information:", error);
      toast({
        title: "Error updating team information",
        description: error?.message || "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Update user's manager
  const updateManager = async (managerEmailToUpdate: string) => {
    setIsUpdating(true);
    try {
      // Step 1: Find the manager's ID from their email
      const { data: managerData, error: managerError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', managerEmailToUpdate)
        .single();

      if (managerError || !managerData) {
        toast({
          title: "Manager not found",
          description: "No user found with that email address.",
          variant: "destructive"
        });
        setIsUpdating(false);
        return;
      }

      // Step 2: Update the user's profile with the new manager ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication error",
          description: "Could not authenticate user.",
          variant: "destructive"
        });
        setIsUpdating(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ manager_id: managerData.id })
        .eq('id', user.id);

      if (updateError) {
        toast({
          title: "Update failed",
          description: updateError.message,
          variant: "destructive"
        });
        setIsUpdating(false);
        return;
      }

      // Step 3: Refresh team associations based on the new manager
      await refreshTeamAssociations();

      // Step 4: Clear the input field and refresh profile data
      setManagerEmail('');
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      
      toast({
        title: "Manager updated",
        description: "Your manager has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating manager:", error);
      toast({
        title: "Update failed",
        description: error?.message || "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Fetch teams
  useEffect(() => {
    const fetchTeams = async () => {
      if (!profile?.id) return;

      try {
        const { data, error } = await supabase
          .from('team_members')
          .select(`
            team:teams (
              id,
              name,
              created_at,
              updated_at
            )
          `)
          .eq('user_id', profile.id);

        if (error) throw error;

        // Extract team data from the nested structure and ensure all required properties are present
        const formattedTeams: Team[] = data
          .filter(item => item.team)
          .map(item => ({
            id: item.team.id,
            name: item.team.name,
            created_at: item.team.created_at,
            updated_at: item.team.updated_at || item.team.created_at // Fallback to created_at if updated_at is not available
          }));

        setTeams(formattedTeams);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    if (!isLoading) {
      fetchTeams();
    }
  }, [profile?.id, isLoading]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Information</CardTitle>
          <CardDescription>Loading team information...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Team Information</span>
          <Badge variant={profile?.manager_id ? "outline" : "destructive"}>
            {profile?.manager_id ? "Manager Assigned" : "No Manager"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Manage your team affiliations and manager relationship
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ManagerSection 
          profile={profile} 
          managerEmail={managerEmail}
          setManagerEmail={setManagerEmail}
          updateManager={updateManager}
          isUpdating={isUpdating}
        />
        
        <Separator />
        
        <TeamsSection 
          teams={teams}
          refreshTeamAssociations={refreshTeamAssociations}
          isUpdating={isUpdating}
        />
      </CardContent>
    </Card>
  );
};

