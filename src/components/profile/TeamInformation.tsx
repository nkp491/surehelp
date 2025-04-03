
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { useManagerValidation } from "./team/useManagerValidation";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { TeamCreationDialog } from "@/components/team/TeamCreationDialog";
import TeamHeader from "./team/TeamHeader";
import ManagerSection from "./team/ManagerSection";
import TeamsSection from "./team/TeamsSection";
import { useTeamInformationLogic } from "@/hooks/useTeamInformationLogic";
import { useTeamAssociationService } from "@/services/team-association";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TeamInformationProps {
  managerId?: string | null;
  onUpdate: (data: any) => void;
}

const TeamInformation = ({
  managerId,
  onUpdate
}: TeamInformationProps) => {
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  
  const { language } = useLanguage();
  const t = translations[language];
  const { validateManagerEmail, isLoading: isValidating } = useManagerValidation();
  const { userRoles } = useRoleCheck();
  const { addUserToManagerTeams } = useTeamAssociationService();
  const { toast } = useToast();
  
  const isManager = userRoles.some(role => role.startsWith('manager_pro'));
  const isAgent = userRoles.some(role => role === 'agent' || role === 'agent_pro');

  const {
    isEditing,
    setIsEditing,
    managerEmail,
    setManagerEmail,
    managerName,
    userTeams,
    isLoadingTeams,
    fixingTeamAssociation,
    isProcessing,
    showAlert,
    alertMessage,
    handleRefreshTeams,
    handleForceTeamAssociation,
    toggleEditing
  } = useTeamInformationLogic(managerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationResult = await validateManagerEmail(managerEmail);
    
    if (validationResult.valid) {
      // Store previous manager ID for comparison
      const prevManagerId = managerId;
      const newManagerId = validationResult.managerId;
      
      // Update profile with new manager
      await onUpdate({ manager_id: newManagerId });
      
      // If manager has changed and we have a new manager, try to add user to manager's teams
      if (newManagerId && newManagerId !== prevManagerId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          console.log("Manager changed, adding user to manager's teams");
          try {
            const success = await addUserToManagerTeams(user.id, newManagerId);
            
            if (success) {
              toast({
                title: "Teams Updated",
                description: "You've been added to your manager's teams.",
              });
            } else {
              console.log("No teams were added - manager might not have teams yet.");
              toast({
                title: "Team Information Updated",
                description: "Manager updated successfully. You may need to refresh teams later when your manager creates teams.",
              });
            }
            
            // Refresh teams to show the new teams
            setTimeout(() => {
              handleRefreshTeams();
            }, 500);
          } catch (error) {
            console.error("Error adding user to manager's teams:", error);
            toast({
              title: "Manager Updated",
              description: "Manager was updated, but there was an issue adding you to their teams. Try using the refresh button.",
              variant: "destructive"
            });
          }
        }
      }
      
      setIsEditing(false);
    }
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      handleSubmit(new Event('submit') as unknown as React.FormEvent);
    } else {
      toggleEditing();
    }
  };

  const handleTeamCreationSuccess = async () => {
    // Wait a moment for the database to update
    setTimeout(async () => {
      await handleRefreshTeams();
    }, 500);
  };

  return (
    <Card className="shadow-sm">
      <TeamHeader 
        isManager={isManager}
        onCreateTeamClick={() => setShowCreateTeamDialog(true)}
        onEditClick={handleToggleEdit}
        isEditing={isEditing}
        isLoading={isValidating}
        isFixing={fixingTeamAssociation || isProcessing}
      />
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <ManagerSection 
            isEditing={isEditing}
            managerName={managerName}
            managerEmail={managerEmail}
            onManagerEmailChange={setManagerEmail}
          />

          <TeamsSection 
            teams={userTeams}
            isLoadingTeams={isLoadingTeams}
            isFixing={fixingTeamAssociation || isProcessing}
            showAlert={showAlert}
            alertMessage={alertMessage}
            onRefresh={handleRefreshTeams}
            onForceTeamAssociation={handleForceTeamAssociation}
            managerId={managerId}
          />
          
          {isEditing && (
            <div className="flex justify-end pt-2">
              <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors" disabled={isValidating || fixingTeamAssociation || isProcessing}>
                {isValidating ? "Saving..." : t.save}
              </button>
            </div>
          )}
        </form>
      </CardContent>
      
      <TeamCreationDialog
        open={showCreateTeamDialog}
        onOpenChange={setShowCreateTeamDialog}
        onSuccess={handleTeamCreationSuccess}
      />
    </Card>
  );
};

export default TeamInformation;
